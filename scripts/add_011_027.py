import json

products_to_add = [
    {
        "id": "011",
        "category": "Downlight (Butterfly)",
        "finishes": [
            {"id": "matte-black", "name": "Matte Black", "hex": "#222222"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "matte-white", "name": "Matte White", "hex": "#F5F5F5"},
            {"id": "gun-black", "name": "Gun Black", "hex": "#3A3A3A"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "65x46", "cutOut": "60", "beamAngle": "24"},
            {"wattage": "12 WATT", "size": "75x55", "cutOut": "70", "beamAngle": "24"},
            {"wattage": "18 WATT", "size": "90x57", "cutOut": "85", "beamAngle": "24"}
        ],
        "media": {
            "thumbnail": "/images/products/011-main.png",
            "technicalDrawing": "/images/products/011-tech.png"
        }
    },
    {
        "id": "012",
        "category": "Downlight (Aurelia)",
        "finishes": [
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "black", "name": "Black", "hex": "#000000"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "75x60", "cutOut": "70", "beamAngle": "24"},
            {"wattage": "12 WATT", "size": "85x70", "cutOut": "80", "beamAngle": "24"},
            {"wattage": "18 WATT", "size": "100x72", "cutOut": "95", "beamAngle": "24"}
        ],
        "media": {
            "thumbnail": "/images/products/012-main.png",
            "technicalDrawing": "/images/products/012-tech.png"
        }
    },
    {
        "id": "013",
        "category": "Downlight (Navea)",
        "finishes": [
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "gun-black", "name": "Gun Black", "hex": "#3A3A3A"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "80x65", "cutOut": "75", "beamAngle": "36"},
            {"wattage": "12 WATT", "size": "90x75", "cutOut": "85", "beamAngle": "36"},
            {"wattage": "18 WATT", "size": "100x85", "cutOut": "95", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/013-main.png",
            "technicalDrawing": "/images/products/013-tech.png"
        }
    },
    {
        "id": "014",
        "category": "Downlight (Star Plus)",
        "finishes": [
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "shining-black", "name": "Shining Black", "hex": "#111111"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "63x52", "cutOut": "45", "beamAngle": "36"},
            {"wattage": "12 WATT", "size": "82x70", "cutOut": "65", "beamAngle": "36"},
            {"wattage": "18 WATT", "size": "88x88", "cutOut": "75", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/014-main.png",
            "technicalDrawing": "/images/products/014-tech.png"
        }
    },
    {
        "id": "015",
        "category": "Downlight (Star)",
        "finishes": [
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "shining-black", "name": "Shining Black", "hex": "#111111"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "62x83", "cutOut": "55", "beamAngle": "38"},
            {"wattage": "12 WATT", "size": "72x95", "cutOut": "65", "beamAngle": "38"},
            {"wattage": "18 WATT", "size": "82x100", "cutOut": "75", "beamAngle": "38"}
        ],
        "media": {
            "thumbnail": "/images/products/015-main.png",
            "technicalDrawing": "/images/products/015-tech.png"
        }
    },
    {
        "id": "016",
        "category": "Downlight (Brezza)",
        "finishes": [
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "bright-silver", "name": "Bright Silver", "hex": "#E0E0E0"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "gun-black", "name": "Gun Black", "hex": "#3A3A3A"},
            {"id": "matte-silver", "name": "Matte Silver", "hex": "#C0C0C0"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"}
        ],
        "specifications": [
            {"wattage": "12 WATT", "size": "65x75", "cutOut": "55", "beamAngle": "60"},
            {"wattage": "18 WATT", "size": "85x81", "cutOut": "75", "beamAngle": "60"},
            {"wattage": "24 WATT", "size": "105x95", "cutOut": "95", "beamAngle": "60"}
        ],
        "media": {
            "thumbnail": "/images/products/016-main.png",
            "technicalDrawing": "/images/products/016-tech.png"
        }
    },
    {
        "id": "017",
        "category": "Downlight (Matrix)",
        "finishes": [
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "gun-black", "name": "Gun Black", "hex": "#3A3A3A"},
            {"id": "bronze", "name": "Bronze", "hex": "#CD7F32"}
        ],
        "specifications": [
            {"wattage": "10 WATT", "size": "70x43", "cutOut": "65", "beamAngle": "36"},
            {"wattage": "15 WATT", "size": "80x46", "cutOut": "75", "beamAngle": "36"},
            {"wattage": "20 WATT", "size": "90x54", "cutOut": "85", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/017-main.png",
            "technicalDrawing": "/images/products/017-tech.png"
        }
    },
    {
        "id": "018",
        "category": "Downlight (Matrix Plus)",
        "finishes": [
            {"id": "gun-black", "name": "Gun Black", "hex": "#3A3A3A"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "bronze", "name": "Bronze", "hex": "#CD7F32"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "black", "name": "Black", "hex": "#000000"}
        ],
        "specifications": [
            {"wattage": "10 WATT", "size": "70x61", "cutOut": "65", "beamAngle": "36"},
            {"wattage": "15 WATT", "size": "80x70", "cutOut": "75", "beamAngle": "36"},
            {"wattage": "20 WATT", "size": "90x80", "cutOut": "85", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/018-main.png",
            "technicalDrawing": "/images/products/018-tech.png"
        }
    },
    {
        "id": "019",
        "category": "Downlight (Polo)",
        "finishes": [
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "gun-black", "name": "Gun Black", "hex": "#3A3A3A"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "55x53", "cutOut": "63", "beamAngle": "36"},
            {"wattage": "12 WATT", "size": "75x65", "cutOut": "83", "beamAngle": "36"},
            {"wattage": "18 WATT", "size": "95x74", "cutOut": "105", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/019-main.png",
            "technicalDrawing": "/images/products/019-tech.png"
        }
    },
    {
        "id": "020",
        "category": "Downlight (Polo Plus)",
        "finishes": [
            {"id": "gun-black", "name": "Gun Black", "hex": "#3A3A3A"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "metallic-black", "name": "Metallic Black", "hex": "#1A1A1A"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "55x53", "cutOut": "63", "beamAngle": "36"},
            {"wattage": "12 WATT", "size": "75x65", "cutOut": "83", "beamAngle": "36"},
            {"wattage": "18 WATT", "size": "95x74", "cutOut": "105", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/020-main.png",
            "technicalDrawing": "/images/products/020-tech.png"
        }
    },
    {
        "id": "021",
        "category": "Downlight (Velvet)",
        "finishes": [
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "55x55", "cutOut": "62", "beamAngle": "36"},
            {"wattage": "12 WATT", "size": "65x60", "cutOut": "82", "beamAngle": "36"},
            {"wattage": "18 WATT", "size": "95x65", "cutOut": "102", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/021-main.png",
            "technicalDrawing": "/images/products/021-tech.png"
        }
    },
    {
        "id": "022",
        "category": "Downlight (Lotus)",
        "finishes": [
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "copper", "name": "Copper", "hex": "#B87333"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "grey", "name": "Grey", "hex": "#808080"},
            {"id": "gun-black", "name": "Gun Black", "hex": "#3A3A3A"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "70x43", "cutOut": "65", "beamAngle": "24/36"},
            {"wattage": "12 WATT", "size": "80x46", "cutOut": "75", "beamAngle": "24/36"},
            {"wattage": "18 WATT", "size": "90x54", "cutOut": "85", "beamAngle": "24/36"}
        ],
        "media": {
            "thumbnail": "/images/products/022-main.png",
            "technicalDrawing": "/images/products/022-tech.png"
        }
    },
    {
        "id": "023",
        "category": "Downlight (Lotus Plus)",
        "finishes": [
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "gun-black", "name": "Gun Black", "hex": "#3A3A3A"},
            {"id": "grey", "name": "Grey", "hex": "#808080"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "70x63", "cutOut": "65", "beamAngle": "36"},
            {"wattage": "12 WATT", "size": "80x72", "cutOut": "75", "beamAngle": "36"},
            {"wattage": "18 WATT", "size": "90x86", "cutOut": "85", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/023-main.png",
            "technicalDrawing": "/images/products/023-tech.png"
        }
    },
    {
        "id": "024",
        "category": "Downlight (Rolex)",
        "finishes": [
            {"id": "gold", "name": "Gold", "hex": "#FFD700"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "grey", "name": "Grey", "hex": "#808080"}
        ],
        "specifications": [
            {"wattage": "10 WATT", "size": "70x63", "cutOut": "65", "beamAngle": "36"},
            {"wattage": "15 WATT", "size": "80x72", "cutOut": "75", "beamAngle": "36"},
            {"wattage": "20 WATT", "size": "90x86", "cutOut": "85", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/024-main.png",
            "technicalDrawing": "/images/products/024-tech.png"
        }
    },
    {
        "id": "025",
        "category": "Panel Light (Moon)",
        "finishes": [
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "black", "name": "Black", "hex": "#000000"}
        ],
        "specifications": [
            {"wattage": "12 WATT", "size": "90x40", "cutOut": "90", "beamAngle": "120"},
            {"wattage": "18 WATT", "size": "120x40", "cutOut": "120", "beamAngle": "120"},
            {"wattage": "24 WATT", "size": "170x40", "cutOut": "170", "beamAngle": "120"}
        ],
        "media": {
            "thumbnail": "/images/products/025-main.png",
            "technicalDrawing": "/images/products/025-tech.png"
        }
    },
    {
        "id": "026",
        "category": "Downlight (N-Surface)",
        "finishes": [
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "black", "name": "Black", "hex": "#000000"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "72x65", "cutOut": "72", "beamAngle": "60"},
            {"wattage": "12 WATT", "size": "92x65", "cutOut": "92", "beamAngle": "60"},
            {"wattage": "18 WATT", "size": "122x65", "cutOut": "122", "beamAngle": "60"},
            {"wattage": "24 WATT", "size": "142x65", "cutOut": "142", "beamAngle": "60"}
        ],
        "media": {
            "thumbnail": "/images/products/026-main.png",
            "technicalDrawing": "/images/products/026-tech.png"
        }
    },
    {
        "id": "027",
        "category": "Cylinder (Creta)",
        "finishes": [
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "silver", "name": "Silver", "hex": "#C0C0C0"},
            {"id": "gun-black", "name": "Gun Black", "hex": "#3A3A3A"},
            {"id": "matte-white", "name": "Matte White", "hex": "#F5F5F5"},
            {"id": "matte-black", "name": "Matte Black", "hex": "#222222"}
        ],
        "specifications": [
            {"wattage": "1 WATT", "size": "32x42", "cutOut": "32", "beamAngle": "24"},
            {"wattage": "3 WATT", "size": "40x45", "cutOut": "40", "beamAngle": "24"},
            {"wattage": "5 WATT", "size": "50x50", "cutOut": "50", "beamAngle": "24"},
            {"wattage": "7 WATT", "size": "62x72", "cutOut": "62", "beamAngle": "24"},
            {"wattage": "12 WATT", "size": "77x90", "cutOut": "77", "beamAngle": "24"},
            {"wattage": "18 WATT", "size": "88x110", "cutOut": "88", "beamAngle": "24"}
        ],
        "media": {
            "thumbnail": "/images/products/027-main.png",
            "technicalDrawing": "/images/products/027-tech.png"
        }
    }
]

file_path = "data/products.json"
with open(file_path, "r") as f:
    products = json.load(f)

products.extend(products_to_add)

with open(file_path, "w") as f:
    json.dump(products, f, indent=2)

print("Successfully added 17 products to products.json!")
