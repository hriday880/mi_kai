import re

path = 'C:/Users/HRIDAY/OneDrive/Documents/mi_kai/public/logo.svg'
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()

# Remove the white background path
s = re.sub(r'<path[^>]*fill="#FEFEFE"[^>]*/>', '', s)

# Replace all other dark fills with gold
s = re.sub(r'fill="#[0-9A-Fa-f]{6}"', 'fill="#D4AF37"', s)

with open(path, 'w', encoding='utf-8') as f:
    f.write(s)
