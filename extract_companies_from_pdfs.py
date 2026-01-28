#!/usr/bin/env python3
"""
Extract company information from PDF files and generate SQL INSERT statements.
"""

import PyPDF2
import os
import re
import unicodedata
from datetime import datetime

# Constants
BATCH_SIZE = 100  # Number of companies per batch in SQL INSERT

# Senegalese cities
SENEGALESE_CITIES = [
    'Dakar', 'Thies', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor',
    'Louga', 'Matam', 'Tambacounda', 'Kolda', 'Sedhiou', 'Kaffrine',
    'Kedougou', 'Kédougou', 'Rufisque', 'Mbour', 'Touba', 'Diourbel',
    'Fatick', 'Guediaw Aye', 'Richard Toll', 'Linguere', 'Linguère',
    'Podor', 'Kanel', 'Vélingara', 'Velingara', 'Oussouye', 'Bignona',
    'Foundiougne', 'Gossas', 'Koungheul', 'Saraya', 'Salémata', 'Salemata',
    'Nioro', 'Kahone', 'Bambey', 'Tivaouane', 'Mbacké', 'Mbacke',
    'Kébémer', 'Kebemer', 'Joal-Fadiouth', 'Pout', 'Khombole',
]

# Address keywords commonly used in Senegalese addresses
ADDRESS_KEYWORDS = [
    'Route', 'Rue', 'Avenue', 'Bd', 'Boulevard', 'Place', 'Zone',
    'Quartier', 'Cite', 'Cité', 'Villa', 'Immeuble', 'Point',
    'Corniche', 'Rocade', 'Face', 'Angle', 'Carrefour', 'Voie',
]

# Activity keywords for business type identification
ACTIVITY_KEYWORDS = [
    'Vente', 'Commerce', 'Services', 'Service', 'Fabrication',
    'Distribution', 'Production', 'Travaux', 'Import', 'Export',
    'Industrie', 'Pharmacie', 'Restaurant', 'Hotel', 'Hôtel',
    'Banque', 'Assurance', 'Transport', 'Construction',
    'Grossiste', 'Repartition', 'Répartition', 'Promotion',
]

def clean_text(text):
    """Clean and normalize text
    
    CRITICAL: This function escapes single quotes for SQL safety.
    All text values MUST pass through this function before being used in SQL statements.
    The clean_text function is the primary defense against SQL injection.
    
    Args:
        text: Raw text to clean
        
    Returns:
        str: Cleaned and SQL-safe text
    """
    if not text:
        return ""
    # Normalize unicode characters
    text = unicodedata.normalize('NFKD', text)
    # Remove extra whitespace
    text = ' '.join(text.split())
    # Escape single quotes for SQL (CRITICAL for SQL safety)
    text = text.replace("'", "''")
    return text.strip()

def create_slug(name):
    """Create a URL-friendly slug from company name
    
    Returns:
        str: URL-friendly slug or 'company-{hash}' if empty after processing
    """
    if not name:
        return f"company-{hash(name) % 10000}"
    
    # Convert to lowercase and normalize
    slug = unicodedata.normalize('NFKD', name.lower())
    slug = slug.encode('ascii', 'ignore').decode('ascii')
    # Replace spaces and special chars with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    # Remove multiple consecutive hyphens
    slug = re.sub(r'-+', '-', slug)
    
    # Handle edge case of empty slug (only special chars)
    if not slug:
        slug = f"company-{hash(name) % 10000}"
    
    # Limit length
    return slug[:100]

def extract_phone_from_end(text):
    """Extract phone number from the end of the text"""
    # Senegalese phone patterns: 33 XXX XX XX or 7X XXX XX XX
    patterns = [
        r'\b(33\s*\d{3}\s*\d{2}\s*\d{2})\s*$',
        r'\b(33\s*\d{7,})\s*$',
        r'\b(7[0-8]\s*\d{3}\s*\d{2}\s*\d{2})\s*$',
        r'\b(7[0-8]\s*\d{7,})\s*$',
        r'\b(\d{2}\s*\d{3}\s*\d{2}\s*\d{2})\s*$',
        r'\b(0\s*\d{9})\s*$',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            phone = match.group(1)
            remaining_text = text[:match.start()].strip()
            return phone, remaining_text
    
    # If no phone found, return empty and full text
    return "", text

def parse_company_line(line):
    """Parse a single line containing company information"""
    line = clean_text(line)
    
    if not line or len(line) < 10:
        return None
    
    # Skip header lines
    if 'Ville' in line and 'Entreprise' in line:
        return None
    
    # Check if line starts with a city
    ville = None
    for city in SENEGALESE_CITIES:
        if line.startswith(city + ' '):
            ville = city
            line = line[len(city):].strip()
            break
    
    if not ville:
        return None
    
    # Extract phone from the end
    tel, remaining = extract_phone_from_end(line)
    
    if not remaining:
        return None
    
    # Now we have: "Entreprise Activité Adresse" in remaining
    # Strategy: Split by known address/activity keywords
    
    # Try to find address start
    address_start_idx = -1
    for keyword in ADDRESS_KEYWORDS:
        # Case insensitive search for keyword as a whole word
        pattern = r'\b' + re.escape(keyword) + r'\b'
        match = re.search(pattern, remaining, re.IGNORECASE)
        if match:
            address_start_idx = match.start()
            break
    
    company_name = ""
    activite = ""
    adresse = ""
    
    if address_start_idx > 0:
        # We found an address
        adresse = remaining[address_start_idx:].strip()
        before_address = remaining[:address_start_idx].strip()
        
        # Now split before_address into company name and activity
        activity_start_idx = -1
        for keyword in ACTIVITY_KEYWORDS:
            pattern = r'\b' + re.escape(keyword) + r'\b'
            match = re.search(pattern, before_address, re.IGNORECASE)
            if match:
                activity_start_idx = match.start()
                break
        
        if activity_start_idx > 0:
            company_name = before_address[:activity_start_idx].strip()
            activite = before_address[activity_start_idx:].strip()
        else:
            # No activity keyword found, assume first half is company, rest is activity
            words = before_address.split()
            if len(words) > 4:
                split_at = len(words) // 2
                company_name = ' '.join(words[:split_at])
                activite = ' '.join(words[split_at:])
            else:
                company_name = before_address
                activite = ""
    else:
        # No address found, split remaining into company and activity
        activity_start_idx = -1
        for keyword in ACTIVITY_KEYWORDS:
            pattern = r'\b' + re.escape(keyword) + r'\b'
            match = re.search(pattern, remaining, re.IGNORECASE)
            if match:
                activity_start_idx = match.start()
                break
        
        if activity_start_idx > 0:
            company_name = remaining[:activity_start_idx].strip()
            activite = remaining[activity_start_idx:].strip()
        else:
            # Assume all is company name if no activity keyword
            company_name = remaining
            activite = ""
    
    # Clean up company name (remove trailing dashes, etc.)
    company_name = re.sub(r'\s*-\s*$', '', company_name).strip()
    
    if not company_name or len(company_name) < 2:
        return None
    
    return {
        'ville': ville,
        'name': company_name,
        'activite': activite,
        'adresse': adresse,
        'tel': tel
    }

def extract_companies_from_pdf(pdf_file):
    """Extract company information from a PDF file
    
    Args:
        pdf_file: Path to the PDF file to process
        
    Returns:
        list: List of company dictionaries with extracted data
    """
    companies = []
    try:
        with open(pdf_file, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text = page.extract_text()
                lines = text.split('\n')
                
                for line in lines:
                    company = parse_company_line(line)
                    if company:
                        companies.append(company)
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(f"Error processing {pdf_file}: {e}")
        print(traceback.format_exc())
    
    return companies

def generate_sql_file(companies, output_file='companies_from_pdfs.sql'):
    """Generate SQL file with CREATE TABLE and INSERT statements"""
    
    # Remove duplicates based on name+ville combination
    seen = set()
    unique_companies = []
    for company in companies:
        key = (company['name'].lower(), company['ville'].lower())
        if key not in seen:
            seen.add(key)
            unique_companies.append(company)
    
    print(f"Total companies: {len(companies)}")
    print(f"Unique companies: {len(unique_companies)}")
    
    # Sort by name for consistency
    unique_companies.sort(key=lambda x: (x['ville'], x['name']))
    
    # Generate SQL
    sql_lines = []
    sql_lines.append('-- ===============================================')
    sql_lines.append('-- Companies Extracted from PDF Files')
    sql_lines.append('-- EchoWork Database')
    sql_lines.append('-- PostgreSQL SQL Script')
    sql_lines.append('-- ===============================================')
    sql_lines.append(f'-- Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    sql_lines.append(f'-- Total companies: {len(unique_companies)}')
    sql_lines.append('-- ===============================================')
    sql_lines.append('')
    sql_lines.append('-- Note: This assumes the Company table exists (run Prisma migrations first)')
    sql_lines.append('-- This script will insert companies into the default category (categoryId = 1)')
    sql_lines.append('-- You may want to update categoryId after import to properly categorize companies')
    sql_lines.append('')
    sql_lines.append('-- ===============================================')
    sql_lines.append('-- CREATE TABLE (for reference - uncomment if needed)')
    sql_lines.append('-- ===============================================')
    sql_lines.append('/*')
    sql_lines.append('CREATE TABLE IF NOT EXISTS "Company" (')
    sql_lines.append('  id SERIAL PRIMARY KEY,')
    sql_lines.append('  name VARCHAR(255) NOT NULL,')
    sql_lines.append('  slug VARCHAR(255) UNIQUE NOT NULL,')
    sql_lines.append('  description TEXT,')
    sql_lines.append('  "imageUrl" VARCHAR(500),')
    sql_lines.append('  ville VARCHAR(100),')
    sql_lines.append('  adresse TEXT,')
    sql_lines.append('  tel VARCHAR(50),')
    sql_lines.append('  activite TEXT,')
    sql_lines.append('  "categoryId" INTEGER NOT NULL,')
    sql_lines.append('  "createdAt" TIMESTAMP DEFAULT NOW(),')
    sql_lines.append('  "updatedAt" TIMESTAMP DEFAULT NOW()')
    sql_lines.append(');')
    sql_lines.append('*/')
    sql_lines.append('')
    sql_lines.append('-- ===============================================')
    sql_lines.append('-- INSERT COMPANIES')
    sql_lines.append('-- ===============================================')
    sql_lines.append('-- Using categoryId = 1 as default (update as needed)')
    sql_lines.append('-- ON CONFLICT DO NOTHING prevents duplicate insertions if re-run')
    sql_lines.append('')
    
    # Track slugs to ensure uniqueness
    slug_counts = {}
    
    # Generate INSERT statements in batches
    for i in range(0, len(unique_companies), BATCH_SIZE):
        batch = unique_companies[i:i+BATCH_SIZE]
        
        sql_lines.append(f'-- Batch {i//BATCH_SIZE + 1}: Companies {i+1} to {min(i+BATCH_SIZE, len(unique_companies))}')
        sql_lines.append('INSERT INTO "Company" (name, slug, description, ville, adresse, tel, activite, "categoryId", "createdAt", "updatedAt") VALUES')
        
        values_lines = []
        for company in batch:
            name = clean_text(company['name'])
            base_slug = create_slug(name)
            
            # Ensure slug uniqueness by appending counter if needed
            if base_slug in slug_counts:
                slug_counts[base_slug] += 1
                slug = f"{base_slug}-{slug_counts[base_slug]}"
            else:
                slug_counts[base_slug] = 0
                slug = base_slug
            
            ville = clean_text(company['ville'])
            adresse = clean_text(company['adresse'])
            tel = clean_text(company['tel'])
            activite = clean_text(company['activite'])
            
            # Create description from activity
            # Note: ville is already SQL-escaped by clean_text, which is necessary for SQL safety
            # The escaped version is used here to maintain consistency in the SQL file
            description = activite if activite else f"Entreprise basée à {ville}"
            
            # Build VALUES line
            # IMPORTANT: All text values have been processed through clean_text()
            # which escapes single quotes for SQL safety. Do not modify this without
            # ensuring proper SQL escaping is maintained.
            values_line = (
                f"  ('{name}', '{slug}', '{description}', "
                f"'{ville}', "
                f"'{adresse if adresse else ''}', "
                f"'{tel if tel else ''}', "
                f"'{activite if activite else ''}', "
                f"1, NOW(), NOW())"
            )
            values_lines.append(values_line)
        
        sql_lines.append(',\n'.join(values_lines))
        sql_lines.append('ON CONFLICT (slug) DO NOTHING;')
        sql_lines.append('')
    
    sql_lines.append('-- ===============================================')
    sql_lines.append('-- RESET SEQUENCE')
    sql_lines.append('-- ===============================================')
    sql_lines.append('SELECT setval(\'"Company_id_seq"\', (SELECT MAX(id) FROM "Company"));')
    sql_lines.append('')
    sql_lines.append('-- ===============================================')
    sql_lines.append('-- VERIFICATION QUERY')
    sql_lines.append('-- ===============================================')
    sql_lines.append('-- Run this to verify import:')
    sql_lines.append('-- SELECT COUNT(*) as total_companies FROM "Company";')
    sql_lines.append('-- SELECT ville, COUNT(*) as count FROM "Company" GROUP BY ville ORDER BY count DESC;')
    sql_lines.append('')
    sql_lines.append('-- ===============================================')
    sql_lines.append('-- IMPORT COMPLETE')
    sql_lines.append('-- ===============================================')
    sql_lines.append(f'-- Successfully prepared {len(unique_companies)} companies for import')
    sql_lines.append('-- ===============================================')
    
    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"\nSQL file generated: {output_file}")
    return output_file

def main():
    """Main function"""
    print("="*60)
    print("Extracting Companies from PDF Files")
    print("="*60)
    
    # Get all PDF files
    pdfs = sorted([f for f in os.listdir('.') if f.endswith('.pdf')])
    print(f"\nFound {len(pdfs)} PDF files")
    
    # Extract companies from all PDFs
    all_companies = []
    for pdf_file in pdfs:
        print(f"\nProcessing: {pdf_file}")
        companies = extract_companies_from_pdf(pdf_file)
        print(f"  Extracted: {len(companies)} companies")
        all_companies.extend(companies)
    
    print(f"\n{'='*60}")
    print(f"Total extracted: {len(all_companies)} companies")
    print('='*60)
    
    # Show sample
    print("\nSample companies:")
    for i, company in enumerate(all_companies[:5], 1):
        print(f"{i}. {company['name']} ({company['ville']})")
        
        # Show activity with ellipsis only if truncated
        activity = company['activite']
        if len(activity) > 60:
            print(f"   Activity: {activity[:60]}...")
        elif activity:
            print(f"   Activity: {activity}")
        else:
            print(f"   Activity: (none)")
        
        # Show address with ellipsis only if truncated
        address = company['adresse']
        if len(address) > 60:
            print(f"   Address: {address[:60]}...")
        elif address:
            print(f"   Address: {address}")
        else:
            print(f"   Address: (none)")
            
        print(f"   Phone: {company['tel'] if company['tel'] else '(none)'}")
        print()
    
    # Generate SQL file
    output_file = generate_sql_file(all_companies)
    
    print(f"\n{'='*60}")
    print("DONE!")
    print(f"SQL file created: {output_file}")
    print('='*60)

if __name__ == '__main__':
    main()
