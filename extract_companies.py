import re
import csv
from datetime import datetime

def extract_company_data_from_sql(sql_content):
    """Extrait les données des commandes INSERT du fichier SQL"""
    
    # Expression régulière pour capturer les valeurs entre parenthèses après INSERT
    insert_pattern = r'INSERT INTO "Company" \(([^)]+)\) VALUES\s*((?:\([^)]+\)(?:,\s*)?)+)'
    
    # Trouver toutes les commandes INSERT
    inserts = re.findall(insert_pattern, sql_content, re.IGNORECASE | re.DOTALL)
    
    companies = []
    
    for columns_str, values_str in inserts:
        # Extraire les noms de colonnes
        columns = [col.strip().strip('"') for col in columns_str.split(',')]
        
        # Nettoyer et diviser les valeurs
        values_blocks = re.findall(r'\(([^)]+)\)', values_str)
        
        for block in values_blocks:
            # Gérer les valeurs avec apostrophes dans le texte
            values = []
            current_value = ""
            in_quotes = False
            escape_next = False
            
            for i, char in enumerate(block):
                if escape_next:
                    current_value += char
                    escape_next = False
                elif char == "'":
                    if i + 1 < len(block) and block[i + 1] == "'":
                        # Apostrophe échappée ('')
                        current_value += "'"
                        i += 1  # Saute le prochain caractère
                    else:
                        in_quotes = not in_quotes
                        current_value += char
                elif char == ',' and not in_quotes:
                    values.append(current_value.strip())
                    current_value = ""
                else:
                    current_value += char
            
            # Ajouter la dernière valeur
            if current_value:
                values.append(current_value.strip())
            
            # Nettoyer les valeurs
            cleaned_values = []
            for val in values:
                # Supprimer les apostrophes autour des valeurs
                if val.startswith("'") and val.endswith("'"):
                    val = val[1:-1]
                # Gérer les apostrophes doubles
                val = val.replace("''", "'")
                cleaned_values.append(val)
            
            # Créer un dictionnaire pour cette entreprise
            if len(cleaned_values) >= len(columns):
                company = {}
                for i, col in enumerate(columns):
                    if i < len(cleaned_values):
                        company[col] = cleaned_values[i]
                companies.append(company)
    
    return companies

def save_to_csv(companies, output_file):
    """Sauvegarde les données en format CSV"""
    
    if not companies:
        print("Aucune donnée à sauvegarder.")
        return
    
    # Déterminer toutes les colonnes possibles
    all_columns = set()
    for company in companies:
        all_columns.update(company.keys())
    
    # Ordre des colonnes (basé sur le schéma SQL)
    column_order = ['name', 'slug', 'description', 'ville', 'adresse', 'tel', 'activite', 'categoryId', 'createdAt', 'updatedAt', 'imageUrl']
    
    # Ajouter les colonnes manquantes
    for col in all_columns:
        if col not in column_order:
            column_order.append(col)
    
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=column_order)
        writer.writeheader()
        
        for company in companies:
            writer.writerow(company)
    
    print(f"Fichier CSV sauvegardé : {output_file}")
    print(f"Nombre d'entreprises exportées : {len(companies)}")

def main():
    # Lire le fichier SQL
    sql_file = 'companies_from_pdfs.sql'
    
    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        print("Extraction des données depuis le fichier SQL...")
        companies = extract_company_data_from_sql(sql_content)
        
        if companies:
            print(f"Données extraites : {len(companies)} entreprises trouvées")
            
            # Générer le nom du fichier CSV
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f'companies_export_{timestamp}.csv'
            
            # Sauvegarder en CSV
            save_to_csv(companies, output_file)
            
            # Afficher un aperçu des données
            print("\nAperçu des premières entreprises :")
            for i, company in enumerate(companies[:5]):
                print(f"\n{i+1}. {company.get('name', 'N/A')}")
                print(f"   Ville: {company.get('ville', 'N/A')}")
                print(f"   Catégorie: {company.get('categoryId', 'N/A')}")
                
        else:
            print("Aucune donnée d'entreprise trouvée dans le fichier SQL.")
            
    except FileNotFoundError:
        print(f"Erreur : Fichier '{sql_file}' non trouvé.")
    except Exception as e:
        print(f"Erreur lors du traitement : {e}")

def convert_specific_sql_to_csv():
    """Version alternative pour convertir directement le contenu SQL fourni"""
    
    # Copie-collez le contenu SQL ici si vous ne voulez pas lire depuis un fichier
    sql_content = "companies_from_pdfs.sql"
    
    print("Extraction des données depuis le contenu SQL...")
    companies = extract_company_data_from_sql(sql_content)
    
    if companies:
        print(f"Données extraites : {len(companies)} entreprises trouvées")
        
        # Générer le nom du fichier CSV
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f'companies_export_{timestamp}.csv'
        
        # Sauvegarder en CSV
        save_to_csv(companies, output_file)
        
        # Afficher un aperçu des données
        print("\nAperçu des premières entreprises :")
        for i, company in enumerate(companies[:5]):
            print(f"\n{i+1}. {company.get('name', 'N/A')}")
            print(f"   Ville: {company.get('ville', 'N/A')}")
            print(f"   Catégorie: {company.get('categoryId', 'N/A')}")
            
    else:
        print("Aucune donnée d'entreprise trouvée dans le contenu SQL.")

if __name__ == "__main__":
    main()
    # Pour utiliser la version directe :
    # convert_specific_sql_to_csv()