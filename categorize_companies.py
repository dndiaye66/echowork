#!/usr/bin/env python3
"""
Script to add proper categoryId to companies in companies_from_pdfs.sql
Based on business activity keywords
"""

import re
from datetime import datetime

# Category mapping with keywords
CATEGORIES = {
    5: {  # Santé
        'keywords': [
            'pharmacie', 'medical', 'sante', 'santé', 'hopital', 'hôpital',
            'clinique', 'hemodialyse', 'laboratoire', 'cabinet medical',
            'centre de sante', 'centre médical', 'soins', 'diagnostic',
            'dispensaire', 'infirmerie', 'chirurgie', 'consultation',
            'dentaire', 'ophtalmologie', 'radiologie', 'nephrologie'
        ]
    },
    2: {  # Restaurants
        'keywords': [
            'restaurant', 'bar', 'cafe', 'café', 'patisserie', 'pâtisserie',
            'boulangerie', 'fast food', 'traiteur', 'alimentation', 'snack',
            'pizzeria', 'bistro', 'brasserie', 'cantine'
        ]
    },
    4: {  # Hôtels
        'keywords': [
            'hotel', 'hôtel', 'hotelerie', 'hôtellerie', 'auberge',
            'gite', 'gîte', 'motel', 'residence hoteliere', 'résidence hôtelière',
            'pension', 'hebergement', 'hébergement', 'lodge'
        ]
    },
    1: {  # Banques
        'keywords': [
            'banque', 'bank', 'credit', 'crédit', 'microfinance',
            'micro-finance', 'etablissement financier', 'établissement financier',
            'institution financiere', 'institution financière', 'caisse',
            'mutuelle de credit', 'mutuelle de crédit', 'pret', 'prêt'
        ]
    },
    3: {  # Services publics
        'keywords': [
            'service public', 'poste', 'telecommunication', 'télécommunication',
            'electricite', 'électricité', 'eau', 'assainissement',
            'senelec', 'sen eau', 'sonatel', 'orange', 'tigo', 'expresso',
            'administration', 'mairie', 'prefecture', 'préfecture'
        ]
    }
}

# Default category (Vente au détail) is 6

def categorize_company(name, activite):
    """
    Categorize a company based on its name and activity
    Returns categoryId (1-6)
    """
    # Combine name and activity for searching
    text = f"{name} {activite}".lower()
    
    # Check each category in order (most specific first)
    for category_id in [5, 2, 4, 1, 3]:  # Check Santé, Restaurants, Hôtels, Banques, Services publics
        keywords = CATEGORIES[category_id]['keywords']
        for keyword in keywords:
            if keyword in text:
                return category_id
    
    # Default to Vente au détail (6)
    return 6

def process_sql_file(input_file, output_file):
    """
    Process the SQL file and update categoryId values
    """
    print(f"Processing {input_file}...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
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
        old_category = int(match.group(8))
        
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
    
    # Update the header comment
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
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
    
    # Write the updated content
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
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
    
    process_sql_file(input_file, output_file)
