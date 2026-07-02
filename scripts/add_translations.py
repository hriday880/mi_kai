import json
import re
import os

finishes_jp = {
    'Champagne': 'シャンパン', 'Bright White': 'ブライトホワイト', 'Black': 'ブラック', 
    'Metallic Black': 'メタリックブラック', 'White': 'ホワイト', 'Shining Black': 'シャイニングブラック', 
    'Grey': 'グレー', 'Bronze': 'ブロンズ', 'Matt Black': 'マットブラック', 'Gun Black': 'ガンブラック', 
    'Rose Gold': 'ローズゴールド', 'Matte Black': 'マットブラック', 'Bright Silver': 'ブライトシルバー', 
    'Matte White': 'マットホワイト', 'Copper': 'カッパー', 'Silver': 'シルバー', 
    'Gold': 'ゴールド', 'Matte Silver': 'マットシルバー'
}

finishes_cn = {
    'Champagne': '香槟色', 'Bright White': '亮白色', 'Black': '黑色', 
    'Metallic Black': '金属黑', 'White': '白色', 'Shining Black': '亮黑色', 
    'Grey': '灰色', 'Bronze': '青铜色', 'Matt Black': '哑光黑', 'Gun Black': '枪黑色', 
    'Rose Gold': '玫瑰金', 'Matte Black': '哑光黑', 'Bright Silver': '亮银色', 
    'Matte White': '哑光白', 'Copper': '铜色', 'Silver': '银色', 
    'Gold': '金色', 'Matte Silver': '哑光银'
}

def translate_cat_jp(cat):
    cat = cat.replace("Downlight", "ダウンライト")
    cat = cat.replace("Cylinder", "シリンダー")
    cat = cat.replace("Track Surface", "トラックサーフェス")
    cat = cat.replace("Stand Track Light", "スタンドトラックライト")
    cat = cat.replace("Panel Light", "パネルライト")
    cat = cat.replace("Delta", "デルタ")
    cat = cat.replace("3Watt Button", "3Wボタン")
    cat = cat.replace("Button", "ボタン")
    cat = cat.replace("Surface Spotlight", "サーフェススポットライト")
    cat = cat.replace("Track Light", "トラックライト")
    cat = cat.replace("Surface シリンダー Housing", "サーフェスシリンダーハウジング")
    return cat

def translate_cat_cn(cat):
    cat = cat.replace("Downlight", "筒灯")
    cat = cat.replace("Cylinder", "圆筒灯")
    cat = cat.replace("Track Surface", "表面轨道")
    cat = cat.replace("Stand Track Light", "支架轨道灯")
    cat = cat.replace("Panel Light", "面板灯")
    cat = cat.replace("Delta", "三角")
    cat = cat.replace("3Watt Button", "3W按钮")
    cat = cat.replace("Button", "按钮")
    cat = cat.replace("Surface Spotlight", "表面射灯")
    cat = cat.replace("Track Light", "轨道灯")
    cat = cat.replace("Surface 圆筒灯 Housing", "表面圆筒外壳")
    return cat


with open("data/products.json", "r") as f:
    products = json.load(f)

unique_categories = set(x["category"] for x in products)
unique_finishes = set(f["name"] for x in products for f in x["finishes"])

categories_en = {c: c for c in unique_categories}
categories_jp = {c: translate_cat_jp(c) for c in unique_categories}
categories_cn = {c: translate_cat_cn(c) for c in unique_categories}

finishes_en = {f: f for f in unique_finishes}
finishes_jp_dict = {f: finishes_jp.get(f, f) for f in unique_finishes}
finishes_cn_dict = {f: finishes_cn.get(f, f) for f in unique_finishes}

for lang, cat_dict, fin_dict in [("en", categories_en, finishes_en), ("jp", categories_jp, finishes_jp_dict), ("cn", categories_cn, finishes_cn_dict)]:
    path = f"i18n/{lang}.json"
    with open(path, "r") as f:
        data = json.load(f)
    
    data["categories"] = cat_dict
    data["finishes"] = fin_dict
    
    with open(path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

print("Translations successfully added to i18n JSON files.")
