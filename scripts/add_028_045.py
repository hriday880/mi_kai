import json

products_to_add = [
    {
        "id": "028",
        "category": "Cylinder (Creta)",
        "finishes": [
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "black", "name": "Black", "hex": "#000000"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "72x65/75", "cutOut": "60", "beamAngle": "120"},
            {"wattage": "12 WATT", "size": "92x65/75", "cutOut": "60", "beamAngle": "120"},
            {"wattage": "18 WATT", "size": "122x65/75", "cutOut": "60", "beamAngle": "64"},
            {"wattage": "24 WATT", "size": "142x65/75", "cutOut": "60", "beamAngle": "64"}
        ],
        "media": {
            "thumbnail": "/images/products/028-main.png",
            "technicalDrawing": "/images/products/028-tech.png"
        }
    },
    {
        "id": "029",
        "category": "Cylinder (Sigma)",
        "finishes": [
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "silver", "name": "Silver", "hex": "#C0C0C0"},
            {"id": "gun-black", "name": "Gun Black", "hex": "#3A3A3A"},
            {"id": "matte-white", "name": "Matte White", "hex": "#F5F5F5"},
            {"id": "matte-black", "name": "Matte Black", "hex": "#222222"}
        ],
        "specifications": [
            {"wattage": "1 WATT", "size": "32x42", "cutOut": "24", "beamAngle": "500"},
            {"wattage": "3 WATT", "size": "40x45", "cutOut": "24", "beamAngle": "500"},
            {"wattage": "5 WATT", "size": "50x50", "cutOut": "24", "beamAngle": "500"},
            {"wattage": "7 WATT", "size": "62x72", "cutOut": "24", "beamAngle": "120"},
            {"wattage": "12 WATT", "size": "77x90", "cutOut": "24", "beamAngle": "120"},
            {"wattage": "18 WATT", "size": "88x110", "cutOut": "24", "beamAngle": "72"}
        ],
        "media": {
            "thumbnail": "/images/products/029-main.png",
            "technicalDrawing": "/images/products/029-tech.png"
        }
    },
    {
        "id": "030",
        "category": "Cylinder (Tepar)",
        "finishes": [
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "80x75", "cutOut": "36", "beamAngle": "288"},
            {"wattage": "12 WATT", "size": "70x80", "cutOut": "36", "beamAngle": "144"},
            {"wattage": "18 WATT", "size": "90x103", "cutOut": "36", "beamAngle": "72"}
        ],
        "media": {
            "thumbnail": "/images/products/030-main.png",
            "technicalDrawing": "/images/products/030-tech.png"
        }
    },
    {
        "id": "031",
        "category": "Cylinder (Movable)",
        "finishes": [
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "57x66", "cutOut": "36", "beamAngle": "200"},
            {"wattage": "12 WATT", "size": "68x80", "cutOut": "36", "beamAngle": "120"},
            {"wattage": "18 WATT", "size": "77x95", "cutOut": "36", "beamAngle": "90"}
        ],
        "media": {
            "thumbnail": "/images/products/031-main.png",
            "technicalDrawing": "/images/products/031-tech.png"
        }
    },
    {
        "id": "032",
        "category": "Cylinder (N-Dee)",
        "finishes": [
            {"id": "silver", "name": "Silver", "hex": "#C0C0C0"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "gun-black", "name": "Gun Black", "hex": "#3A3A3A"},
            {"id": "gold", "name": "Gold", "hex": "#FFD700"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "63x78", "cutOut": "24", "beamAngle": "160"},
            {"wattage": "12 WATT", "size": "78x95", "cutOut": "24", "beamAngle": "90"},
            {"wattage": "18 WATT", "size": "88x105", "cutOut": "24", "beamAngle": "60"}
        ],
        "media": {
            "thumbnail": "/images/products/032-main.png",
            "technicalDrawing": "/images/products/032-tech.png"
        }
    },
    {
        "id": "033",
        "category": "Surface Cylinder Housing",
        "finishes": [
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "matte-black", "name": "Matte Black", "hex": "#222222"},
            {"id": "black", "name": "Black", "hex": "#000000"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "55x72", "cutOut": "36", "beamAngle": "200"},
            {"wattage": "12 WATT", "size": "72x85", "cutOut": "36", "beamAngle": "120"},
            {"wattage": "18 WATT", "size": "92x100", "cutOut": "36", "beamAngle": "120"},
            {"wattage": "30 WATT", "size": "122x115", "cutOut": "45", "beamAngle": "80"},
            {"wattage": "50 WATT", "size": "142x145", "cutOut": "45", "beamAngle": "48"}
        ],
        "media": {
            "thumbnail": "/images/products/033-main.png",
            "technicalDrawing": "/images/products/033-tech.png"
        }
    },
    {
        "id": "034",
        "category": "Cylinder (Royal)",
        "finishes": [
            {"id": "matte-white", "name": "Matte White", "hex": "#F5F5F5"},
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "matte-black", "name": "Matte Black", "hex": "#222222"},
            {"id": "bright-silver", "name": "Bright Silver", "hex": "#E0E0E0"},
            {"id": "gold", "name": "Gold", "hex": "#FFD700"},
            {"id": "gun-black", "name": "Gun Black", "hex": "#3A3A3A"},
            {"id": "matte-silver", "name": "Matte Silver", "hex": "#C0C0C0"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "50x82", "cutOut": "50", "beamAngle": "36"},
            {"wattage": "12 WATT", "size": "70x100", "cutOut": "70", "beamAngle": "36"},
            {"wattage": "18 WATT", "size": "90x120", "cutOut": "90", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/034-main.png",
            "technicalDrawing": "/images/products/034-tech.png"
        }
    },
    {
        "id": "035",
        "category": "3Watt Button",
        "finishes": [
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "bronze", "name": "Bronze", "hex": "#CD7F32"}
        ],
        "specifications": [
            {"wattage": "7 WATT", "size": "63x53", "cutOut": "36", "beamAngle": "210"},
            {"wattage": "12 WATT", "size": "83x65", "cutOut": "36", "beamAngle": "90"},
            {"wattage": "18 WATT", "size": "105x74", "cutOut": "36", "beamAngle": "48"}
        ],
        "media": {
            "thumbnail": "/images/products/035-main.png",
            "technicalDrawing": "/images/products/035-tech.png"
        }
    },
    {
        "id": "036",
        "category": "Button (Ring)",
        "finishes": [
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"}
        ],
        "specifications": [
            {"wattage": "3 WATT", "size": "39x29", "cutOut": "30", "beamAngle": "24"}
        ],
        "media": {
            "thumbnail": "/images/products/036-main.png",
            "technicalDrawing": "/images/products/036-tech.png"
        }
    },
    {
        "id": "037",
        "category": "Button (3W Curva)",
        "finishes": [
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"}
        ],
        "specifications": [
            {"wattage": "1 WATT", "size": "25x30", "cutOut": "32", "beamAngle": "36"},
            {"wattage": "3 WATT", "size": "30x30", "cutOut": "40", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/037-main.png",
            "technicalDrawing": "/images/products/037-tech.png"
        }
    },
    {
        "id": "038",
        "category": "Button (Premium)",
        "finishes": [
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "matte-black", "name": "Matte Black", "hex": "#222222"}
        ],
        "specifications": [
            {"wattage": "1 WATT", "size": "35x22", "cutOut": "47", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/038-main.png",
            "technicalDrawing": "/images/products/038-tech.png"
        }
    },
    {
        "id": "039",
        "category": "Delta (Mini)",
        "finishes": [
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "rose-gold", "name": "Rose Gold", "hex": "#B76E79"},
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "metallic-black", "name": "Metallic Black", "hex": "#1A1A1A"}
        ],
        "specifications": [
            {"wattage": "3 WATT", "size": "30x34", "cutOut": "36", "beamAngle": "36"},
            {"wattage": "5 WATT", "size": "35x35", "cutOut": "40", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/039-main.png",
            "technicalDrawing": "/images/products/039-tech.png"
        }
    },
    {
        "id": "040",
        "category": "Cylinder (Oraa)",
        "finishes": [
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"}
        ],
        "specifications": [
            {"wattage": "5 WATT", "size": "38x45", "cutOut": "35", "beamAngle": "24"}
        ],
        "media": {
            "thumbnail": "/images/products/040-main.png",
            "technicalDrawing": "/images/products/040-tech.png"
        }
    },
    {
        "id": "041",
        "category": "Cylinder (Lens)",
        "finishes": [
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"}
        ],
        "specifications": [
            {"wattage": "1 WATT", "size": "45x30", "cutOut": "36", "beamAngle": "500"},
            {"wattage": "3 WATT", "size": "48x36", "cutOut": "36", "beamAngle": "500"},
            {"wattage": "5 WATT", "size": "52x45", "cutOut": "36", "beamAngle": "500"}
        ],
        "media": {
            "thumbnail": "/images/products/041-main.png",
            "technicalDrawing": "/images/products/041-tech.png"
        }
    },
    {
        "id": "042",
        "category": "Track Light",
        "finishes": [
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"}
        ],
        "specifications": [
            {"wattage": "1 WATT", "size": "45x30", "cutOut": "24", "beamAngle": "500"},
            {"wattage": "3 WATT", "size": "60x40", "cutOut": "24", "beamAngle": "500"},
            {"wattage": "5 WATT", "size": "50x50", "cutOut": "24", "beamAngle": "500"}
        ],
        "media": {
            "thumbnail": "/images/products/042-main.png",
            "technicalDrawing": "/images/products/042-tech.png"
        }
    },
    {
        "id": "043",
        "category": "Track Surface",
        "finishes": [
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "black", "name": "Black", "hex": "#000000"}
        ],
        "specifications": [
            {"wattage": "10 WATT", "size": "100x50", "cutOut": "38", "beamAngle": "120"},
            {"wattage": "20 WATT", "size": "130x60", "cutOut": "38", "beamAngle": "120"},
            {"wattage": "30 WATT", "size": "150x75", "cutOut": "38", "beamAngle": "120"},
            {"wattage": "50 WATT", "size": "190x90", "cutOut": "38", "beamAngle": "120"}
        ],
        "media": {
            "thumbnail": "/images/products/043-main.png",
            "technicalDrawing": "/images/products/043-tech.png"
        }
    },
    {
        "id": "044",
        "category": "Surface Spotlight",
        "finishes": [
            {"id": "white", "name": "White", "hex": "#FFFFFF"},
            {"id": "black", "name": "Black", "hex": "#000000"}
        ],
        "specifications": [
            {"wattage": "3 WATT", "size": "30x55", "cutOut": "80", "beamAngle": "36"},
            {"wattage": "6 WATT", "size": "40x65", "cutOut": "80", "beamAngle": "36"},
            {"wattage": "9 WATT", "size": "50x85", "cutOut": "80", "beamAngle": "36"}
        ],
        "media": {
            "thumbnail": "/images/products/044-main.png",
            "technicalDrawing": "/images/products/044-tech.png"
        }
    },
    {
        "id": "045",
        "category": "Stand Track Light",
        "finishes": [
            {"id": "black", "name": "Black", "hex": "#000000"},
            {"id": "white", "name": "White", "hex": "#FFFFFF"}
        ],
        "specifications": [
            {"wattage": "3 WATT", "size": "30x75", "cutOut": "36", "beamAngle": "200"},
            {"wattage": "6 WATT", "size": "35x80", "cutOut": "36", "beamAngle": "200"},
            {"wattage": "9 WATT", "size": "45x95", "cutOut": "36", "beamAngle": "200"}
        ],
        "media": {
            "thumbnail": "/images/products/045-main.png",
            "technicalDrawing": "/images/products/045-tech.png"
        }
    }
]

file_path = "data/products.json"
with open(file_path, "r") as f:
    products = json.load(f)

products.extend(products_to_add)

with open(file_path, "w") as f:
    json.dump(products, f, indent=2)

print("Successfully added products 028-045 to products.json!")
