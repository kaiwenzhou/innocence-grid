"""
CDCR Inmate Information Scraper
Queries the CDCR database for inmate records and populates Supabase database
Website: https://ciris.mt.cdcr.ca.gov/
"""

import os
import sys
import time
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from playwright.sync_api import sync_playwright, Page, Browser

# Load environment variables
load_dotenv()

class CDCRInmateScraper:
    """
    Scraper to query and extract inmate information from CDCR database
    and populate Supabase inmates and board_of_parole_hearings tables
    """

    BASE_URL = "https://ciris.mt.cdcr.ca.gov/"

    def __init__(self, supabase_url: str = None, supabase_key: str = None):
        """Initialize the scraper with Supabase connection"""
        self.supabase_url = supabase_url or os.getenv('VITE_SUPABASE_URL')
        self.supabase_key = supabase_key or os.getenv('VITE_SUPABASE_ANON_KEY')

        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL and Key must be provided or set in .env file")

        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        self.results = []
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    def get_unique_cdcr_numbers(self) -> List[str]:
        """
        Fetch all unique CDCR numbers from the transcripts table

        Returns:
            List of unique CDCR numbers (excluding nulls)
        """
        print("Fetching CDCR numbers from transcripts table...")

        response = self.supabase.table('transcripts').select('cdcr_number').execute()

        # Extract unique CDCR numbers, filtering out nulls and empty strings
        cdcr_numbers = set()
        for record in response.data:
            cdcr_num = record.get('cdcr_number')
            if cdcr_num and cdcr_num.strip():
                cdcr_numbers.add(cdcr_num.strip())

        print(f"Found {len(cdcr_numbers)} unique CDCR numbers")
        return sorted(list(cdcr_numbers))

    def check_if_inmate_exists(self, cdcr_number: str) -> bool:
        """
        Check if inmate data already exists in database

        Args:
            cdcr_number: CDCR number to check

        Returns:
            True if exists, False otherwise
        """
        response = self.supabase.table('inmates').select('cdcr_number').eq('cdcr_number', cdcr_number).execute()
        return len(response.data) > 0

    def search_cdcr_number(self, page: Page, cdcr_number: str) -> Dict[str, Any]:
        """
        Search for an inmate by CDCR number and extract all information

        Args:
            page: Playwright Page object
            cdcr_number: The CDCR number to search (e.g., 'D54803', 'T97214')

        Returns:
            Dict containing inmate information and parole hearings
        """

        inmate_data = {
            "cdcr_number": cdcr_number,
            "name": None,
            "age": None,
            "admission_date": None,
            "current_location": None,
            "commitment_county": None,
            "parole_eligible_date": None,
            "board_of_parole_hearings": []
        }

        try:
            # Step 1: Navigate to CDCR website
            print(f"  Navigating to CDCR website...")
            page.goto(self.BASE_URL, wait_until='networkidle', timeout=30000)
            time.sleep(2)

            # Step 2: Accept disclaimer
            print(f"  Accepting disclaimer...")
            page.click('input[value="AGREE"]', timeout=10000)
            time.sleep(2)

            # Step 3: Switch to CDCR Number search mode
            print(f"  Switching to CDCR Number search...")
            page.click('input[value="CDCR"]', timeout=10000)
            time.sleep(1)

            # Step 4: Enter CDCR number
            print(f"  Entering CDCR number: {cdcr_number}")
            page.fill('input[name="k_number"]', cdcr_number)
            time.sleep(1)

            # Step 5: Click search button
            print(f"  Executing search...")
            page.click('input[type="submit"][value="SEARCH"]', timeout=10000)
            time.sleep(3)

            # Check for "No Records Found" message
            no_records_text = page.locator('body').text_content()
            if "No records found" in no_records_text or "no records found" in no_records_text.lower():
                print(f"  ⚠️  No records found for CDCR number: {cdcr_number}")
                return inmate_data

            # Step 6: Extract search results
            print(f"  Extracting search results...")
            try:
                # Extract from results table
                results_table = page.locator('table').nth(1)  # Usually the second table contains results

                # Extract name (usually in the first data row, first cell as a link)
                name_link = results_table.locator('a').first
                if name_link.count() > 0:
                    inmate_data["name"] = name_link.text_content().strip()

                # Extract age, admission date, current location, commitment county
                # These are typically in the table cells
                cells = results_table.locator('td')
                cell_texts = [cells.nth(i).text_content().strip() for i in range(min(cells.count(), 20))]

                # Pattern matching based on CDCR website structure
                # Adjust indices based on actual table structure
                if len(cell_texts) > 1:
                    inmate_data["age"] = self._parse_age(cell_texts)
                    inmate_data["admission_date"] = self._parse_date(cell_texts, "admission")
                    inmate_data["current_location"] = self._parse_location(cell_texts)
                    inmate_data["commitment_county"] = self._parse_county(cell_texts)

            except Exception as e:
                print(f"  ⚠️  Error extracting search results: {e}")

            # Step 7: Click on inmate name to access detailed record
            print(f"  Accessing detailed record...")
            name_link = page.locator('table').nth(1).locator('a').first
            if name_link.count() > 0:
                name_link.click()
                time.sleep(3)

                # Step 8: Extract detailed information
                print(f"  Extracting detailed information...")
                try:
                    # Extract Parole Eligible Date
                    page_text = page.locator('body').text_content()
                    inmate_data["parole_eligible_date"] = self._extract_parole_eligible_date(page_text)

                    # Extract Board of Parole Hearings table
                    inmate_data["board_of_parole_hearings"] = self._extract_parole_hearings(page)

                except Exception as e:
                    print(f"  ⚠️  Error extracting detailed information: {e}")

            print(f"  ✓ Successfully extracted data for {cdcr_number}")

        except Exception as e:
            print(f"  ✗ Error searching for CDCR number {cdcr_number}: {e}")

        return inmate_data

    def _parse_age(self, cell_texts: List[str]) -> Optional[int]:
        """Parse age from cell texts"""
        for text in cell_texts:
            if text.isdigit() and 10 <= int(text) <= 120:
                return int(text)
        return None

    def _parse_date(self, cell_texts: List[str], date_type: str) -> Optional[str]:
        """Parse date from cell texts (MM/DD/YYYY format)"""
        import re
        date_pattern = r'\d{1,2}/\d{1,2}/\d{4}'
        for text in cell_texts:
            if re.match(date_pattern, text):
                try:
                    # Convert MM/DD/YYYY to YYYY-MM-DD
                    date_obj = datetime.strptime(text, '%m/%d/%Y')
                    return date_obj.strftime('%Y-%m-%d')
                except:
                    pass
        return None

    def _parse_location(self, cell_texts: List[str]) -> Optional[str]:
        """Parse current location from cell texts"""
        # Location typically contains prison/facility names
        location_keywords = ['PRISON', 'FACILITY', 'CENTER', 'CAMP', 'INSTITUTION']
        for text in cell_texts:
            if any(keyword in text.upper() for keyword in location_keywords):
                return text
        return None

    def _parse_county(self, cell_texts: List[str]) -> Optional[str]:
        """Parse commitment county from cell texts"""
        # County typically ends with "COUNTY" or is in a specific position
        for text in cell_texts:
            if 'COUNTY' in text.upper():
                return text
        return None

    def _extract_parole_eligible_date(self, page_text: str) -> Optional[str]:
        """Extract Parole Eligible Date from page text"""
        import re
        # Look for patterns like "Parole Eligible Date: MM/DD/YYYY"
        patterns = [
            r'Parole Eligible Date:\s*(\d{1,2}/\d{1,2}/\d{4})',
            r'Eligible for Parole:\s*(\d{1,2}/\d{1,2}/\d{4})',
        ]

        for pattern in patterns:
            match = re.search(pattern, page_text, re.IGNORECASE)
            if match:
                try:
                    date_obj = datetime.strptime(match.group(1), '%m/%d/%Y')
                    return date_obj.strftime('%Y-%m-%d')
                except:
                    pass
        return None

    def _extract_parole_hearings(self, page: Page) -> List[Dict[str, Any]]:
        """Extract Board of Parole Hearings table"""
        hearings = []

        try:
            # Look for table with parole hearings
            # Typically has headers: Date, Action, Status, Outcome
            tables = page.locator('table')

            for i in range(tables.count()):
                table = tables.nth(i)
                headers = table.locator('th')

                # Check if this is the parole hearings table
                header_texts = [headers.nth(j).text_content().strip().upper() for j in range(headers.count())]

                if any('PAROLE' in h or 'HEARING' in h for h in header_texts):
                    # Extract rows
                    rows = table.locator('tr')

                    for j in range(1, rows.count()):  # Skip header row
                        row = rows.nth(j)
                        cells = row.locator('td')

                        if cells.count() >= 4:
                            hearing = {
                                "date": cells.nth(0).text_content().strip(),
                                "action": cells.nth(1).text_content().strip(),
                                "status": cells.nth(2).text_content().strip(),
                                "outcome": cells.nth(3).text_content().strip()
                            }

                            # Convert date to YYYY-MM-DD
                            if hearing["date"]:
                                try:
                                    date_obj = datetime.strptime(hearing["date"], '%m/%d/%Y')
                                    hearing["date"] = date_obj.strftime('%Y-%m-%d')
                                except:
                                    pass

                            hearings.append(hearing)
                    break

        except Exception as e:
            print(f"    ⚠️  Error extracting parole hearings: {e}")

        return hearings

    def save_to_database(self, inmate_data: Dict[str, Any]) -> bool:
        """
        Save inmate data to Supabase database

        Args:
            inmate_data: Dictionary containing inmate information

        Returns:
            True if successful, False otherwise
        """
        try:
            cdcr_number = inmate_data["cdcr_number"]

            # Check if inmate already exists
            existing = self.supabase.table('inmates').select('*').eq('cdcr_number', cdcr_number).execute()

            inmate_record = {
                "cdcr_number": cdcr_number,
                "name": inmate_data.get("name"),
                "age": inmate_data.get("age"),
                "admission_date": inmate_data.get("admission_date"),
                "current_location": inmate_data.get("current_location"),
                "commitment_county": inmate_data.get("commitment_county"),
                "parole_eligible_date": inmate_data.get("parole_eligible_date"),
                "last_scraped_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }

            if existing.data:
                # Update existing record
                print(f"  Updating existing inmate record for {cdcr_number}")
                self.supabase.table('inmates').update(inmate_record).eq('cdcr_number', cdcr_number).execute()
            else:
                # Insert new record
                print(f"  Inserting new inmate record for {cdcr_number}")
                self.supabase.table('inmates').insert(inmate_record).execute()

            # Save parole hearings
            if inmate_data.get("board_of_parole_hearings"):
                # Delete existing hearings
                self.supabase.table('board_of_parole_hearings').delete().eq('cdcr_number', cdcr_number).execute()

                # Insert new hearings
                hearings_to_insert = []
                for hearing in inmate_data["board_of_parole_hearings"]:
                    hearings_to_insert.append({
                        "cdcr_number": cdcr_number,
                        "hearing_date": hearing.get("date"),
                        "action": hearing.get("action"),
                        "status": hearing.get("status"),
                        "outcome": hearing.get("outcome")
                    })

                if hearings_to_insert:
                    print(f"  Inserting {len(hearings_to_insert)} parole hearing records")
                    self.supabase.table('board_of_parole_hearings').insert(hearings_to_insert).execute()

            return True

        except Exception as e:
            print(f"  ✗ Error saving to database: {e}")
            return False

    def scrape_all_transcripts(self, force_refresh: bool = False, headless: bool = True):
        """
        Scrape CDCR data for all transcripts with CDCR numbers

        Args:
            force_refresh: If True, re-scrape even if data already exists
            headless: If True, run browser in headless mode
        """
        cdcr_numbers = self.get_unique_cdcr_numbers()

        if not cdcr_numbers:
            print("No CDCR numbers found in transcripts table")
            return

        print(f"\n{'='*80}")
        print(f"Starting CDCR scraping for {len(cdcr_numbers)} inmates")
        print(f"{'='*80}\n")

        with sync_playwright() as p:
            browser: Browser = p.chromium.launch(headless=headless)
            page: Page = browser.new_page()

            success_count = 0
            skip_count = 0
            error_count = 0

            for i, cdcr_number in enumerate(cdcr_numbers, 1):
                print(f"\n[{i}/{len(cdcr_numbers)}] Processing CDCR number: {cdcr_number}")

                # Skip if already exists and not forcing refresh
                if not force_refresh and self.check_if_inmate_exists(cdcr_number):
                    print(f"  ⏭️  Skipping - data already exists (use --force to re-scrape)")
                    skip_count += 1
                    continue

                # Search and extract data
                inmate_data = self.search_cdcr_number(page, cdcr_number)

                # Save to database
                if self.save_to_database(inmate_data):
                    success_count += 1
                    self.results.append(inmate_data)
                else:
                    error_count += 1

                # Brief pause between searches
                if i < len(cdcr_numbers):
                    time.sleep(2)

            browser.close()

        # Print summary
        print(f"\n{'='*80}")
        print(f"SCRAPING COMPLETE")
        print(f"{'='*80}")
        print(f"Total CDCR numbers: {len(cdcr_numbers)}")
        print(f"Successfully scraped: {success_count}")
        print(f"Skipped (already exists): {skip_count}")
        print(f"Errors: {error_count}")
        print(f"{'='*80}\n")


def main():
    """Main entry point for the scraper"""
    import argparse

    parser = argparse.ArgumentParser(description='CDCR Inmate Information Scraper')
    parser.add_argument('--force', action='store_true', help='Force re-scrape even if data exists')
    parser.add_argument('--visible', action='store_true', help='Run browser in visible mode (not headless)')
    parser.add_argument('--cdcr', type=str, help='Scrape a specific CDCR number')

    args = parser.parse_args()

    try:
        scraper = CDCRInmateScraper()

        if args.cdcr:
            # Scrape single CDCR number
            print(f"Scraping single CDCR number: {args.cdcr}")

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=not args.visible)
                page = browser.new_page()

                inmate_data = scraper.search_cdcr_number(page, args.cdcr)
                scraper.save_to_database(inmate_data)

                browser.close()

            print("\n" + "="*80)
            print(json.dumps(inmate_data, indent=2))
            print("="*80)
        else:
            # Scrape all transcripts
            scraper.scrape_all_transcripts(
                force_refresh=args.force,
                headless=not args.visible
            )

    except KeyboardInterrupt:
        print("\n\nScraping interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
