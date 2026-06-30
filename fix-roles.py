import os
import re

def get_files(d):
    paths = []
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.ts'):
                paths.append(os.path.join(root, f))
    return paths

files = get_files('app/api')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if "session.role !== 'admin'" in content:
        new_content = content.replace("session.role !== 'admin'", "(session.role !== 'admin' && session.role !== 'landlord')")
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print('Updated ' + f)
