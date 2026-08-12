import json
import os

def build_dict():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    cat_files = [
        ('Животные', os.path.join(script_dir, 'data_animals.json')),
        ('Природа', os.path.join(script_dir, 'data_nature.json')),
        ('Сказки', os.path.join(script_dir, 'data_fairytales.json')),
        ('Изобретения', os.path.join(script_dir, 'data_inventions.json')),
        ('Космос', os.path.join(script_dir, 'data_space.json'))
    ]

    dictionary = []
    
    for cat_name, file_path in cat_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            items = json.load(f)
            
        for i, item in enumerate(items):
            if isinstance(item, list) and len(item) >= 2:
                word = item[0].strip().upper()
                hint = item[1].strip()
            elif isinstance(item, dict):
                word = item.get('word', '').strip().upper()
                hint = item.get('hint', '').strip()
            else:
                continue

            entry = {
                "word": word,
                "hint": hint,
                "category": cat_name,
                "difficulty": 1 if len(word) <= 6 else 2,
                "superGame": (i % 5 == 0)
            }
            dictionary.append(entry)

    out_path = os.path.join(script_dir, '../src/assets/dictionary.json')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(dictionary, f, ensure_ascii=False, indent=2)

    print(f"Generated dictionary with {len(dictionary)} words at {out_path}")

if __name__ == '__main__':
    build_dict()
