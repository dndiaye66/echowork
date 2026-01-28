#!/usr/bin/env python3
"""
Script to add proper categoryId to companies in companies_from_pdfs.sql
Based on business activity keywords
"""

import re
import sys
import tempfile
import shutil
from datetime import datetime

# Category mapping with keywords
CATEGORIES = {
    5: {  # Santé
        'keywords': [
            r'\bpharmacie\b', r'\bmedical\b', r'\bsante\b', r'\bsanté\b', r'\bhopital\b', r'\bhôpital\b',
            r'\bclinique\b', r'\bhemodialyse\b', r'\blaboratoire\b', r'\bcabinet medical\b',
            r'\bcentre de sante\b', r'\bcentre médical\b', r'\bsoins\b', r'\bdiagnostic\b',
            r'\bdispensaire\b', r'\binfirmerie\b', r'\bchirurgie\b', r'\bconsultation\b',
            r'\bdentaire\b', r'\bophtalmologie\b', r'\bradiologie\b', r'\bnephrologie\b'
        ]
    },
    2: {  # Restaurants
        'keywords': [
            r'\brestaurant\b', r'\bbar\b', r'\bcafe\b', r'\bcafé\b', r'\bpatisserie\b', r'\bpâtisserie\b',
            r'\bboulangerie\b', r'\bfast food\b', r'\btraiteur\b', r'\balimentation\b', r'\bsnack\b',
            r'\bpizzeria\b', r'\bbistro\b', r'\bbrasserie\b', r'\bcantine\b'
        ]
    },
    4: {  # Hôtels
        'keywords': [
            r'\bhotel\b', r'\bhôtel\b', r'\bhotelerie\b', r'\bhôtellerie\b', r'\bauberge\b',
            r'\bgite\b', r'\bgîte\b', r'\bmotel\b', r'\bresidence hoteliere\b', r'\brésidence hôtelière\b',
            r'\bpension\b', r'\bhebergement\b', r'\bhébergement\b', r'\blodge\b'
        ]
    },
    1: {  # Banques
        'keywords': [
            r'\bbanque\b', r'\bbank\b', r'\bcredit\b', r'\bcrédit\b', r'\bmicrofinance\b',
            r'\bmicro-finance\b', r'\betablissement financier\b', r'\bétablissement financier\b',
            r'\binstitution financiere\b', r'\binstitution financière\b', r'\bcaisse\b',
            r'\bmutuelle de credit\b', r'\bmutuelle de crédit\b', r'\bpret\b', r'\bprêt\b'
        ]
    },
    3: {  # Services publics
        'keywords': [
            r'\bservice public\b', r'\bposte\b', r'\btelecommunication\b', r'\btélécommunication\b',
            r'\belectricite\b', r'\bélectricité\b', r'\beau\b', r'\bassainissement\b',
            r'\bsenelec\b', r'\bsen eau\b', r'\bsonatel\b'
        ]
    }
}

# Default category (Vente au détail) is 6

def categorize_company(name, activite):
    """
    Categorize a company based on its name and activity using regex patterns.
    
    Args:
        name: Company name (string)
        activite: Company activity description (string)
        
    Returns:
        int: categoryId (1-6)
    """
    # Combine name and activity for searching
    text = f"{name} {activite}".lower()
    
    # Check each category in order (most specific first)
    for category_id in [5, 2, 4, 1, 3]:  # Check Santé, Restaurants, Hôtels, Banques, Services publics
        patterns = CATEGORIES[category_id]['keywords']
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return category_id
    
    # Default to Vente au détail (6)
    return 6

def process_sql_file(input_file, output_file):
    """
    Process the SQL file and update categoryId values.
    
    Args:
        input_file: Path to input SQL file
        output_file: Path to output SQL file
        
    Raises:
        FileNotFoundError: If input file doesn't exist
        Exception: If processing fails
    """
    print(f"Processing {input_file}...")
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)
    
    # Statistics
    stats = {cat_id: 0 for cat_id in range(1, 7)}
    total_companies = 0
    
    # Pattern to match INSERT statements
    # Match: ('name', 'slug', 'description', 'ville', 'adresse', 'tel', 'activite', categoryId, NOW(), NOW())
    pattern = r"\('([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*(\d+),\s*NOW\(\),\s*NOW\(\)\)"
    
    def replace_category(match):
        nonlocal total_companies
        name = match.group(1).replace("''", "'")
        slug = match.group(2)
        description = match.group(3).replace("''", "'")
        ville = match.group(4)
        adresse = match.group(5).replace("''", "'")
        tel = match.group(6)
        activite = match.group(7).replace("''", "'")
        
        # Determine new category
        new_category = categorize_company(name, activite)
        
        # Update statistics
        total_companies += 1
        stats[new_category] += 1
        
        # Return updated line (escape single quotes)
        name_escaped = name.replace("'", "''")
        description_escaped = description.replace("'", "''")
        adresse_escaped = adresse.replace("'", "''")
        activite_escaped = activite.replace("'", "''")
        
        return f"('{name_escaped}', '{slug}', '{description_escaped}', '{ville}', '{adresse_escaped}', '{tel}', '{activite_escaped}', {new_category}, NOW(), NOW())"
    
    # Replace all categoryId values
    new_content = re.sub(pattern, replace_category, content)
    
    # Validate that we found and processed companies
    if total_companies == 0:
        print("Warning: No companies were found in the SQL file. Check the file format.")
        sys.exit(1)
    
    # Update the header comment
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    if re.search(r'-- Generated: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}', new_content):
        new_content = re.sub(
            r'-- Generated: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}',
            f'-- Generated: {timestamp}',
            new_content
        )
    
    # Update the note about categoryId
    new_content = new_content.replace(
        '-- This script will insert companies into the default category (categoryId = 1)\n-- You may want to update categoryId after import to properly categorize companies',
        '-- Companies have been automatically categorized based on their business activities'
    )
    
    # Write to a temporary file first, then move to final location
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', delete=False, 
                                        dir='.', suffix='.sql') as tmp_file:
            tmp_file.write(new_content)
            tmp_filename = tmp_file.name
        
        # Move temporary file to final location
        shutil.move(tmp_filename, output_file)
        
    except Exception as e:
        print(f"Error writing output file: {e}")
        sys.exit(1)
    
    # Print statistics
    print(f"\nCategorization complete!")
    print(f"Total companies processed: {total_companies}")
    print("\nBreakdown by category:")
    print(f"  1. Banques: {stats[1]}")
    print(f"  2. Restaurants: {stats[2]}")
    print(f"  3. Services publics: {stats[3]}")
    print(f"  4. Hôtels: {stats[4]}")
    print(f"  5. Santé: {stats[5]}")
    print(f"  6. Vente au détail: {stats[6]}")
    print(f"\nUpdated file saved to: {output_file}")

if __name__ == '__main__':
    input_file = 'companies_from_pdfs.sql'
    output_file = 'companies_from_pdfs.sql'
    
    try:
        process_sql_file(input_file, output_file)
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        sys.exit(1)

