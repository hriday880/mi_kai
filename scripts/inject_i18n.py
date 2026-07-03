import json
import os

langs = ['en', 'jp', 'cn']
data = {
    'en': {
        'studio': {
            'title': 'Mi-KAI Light Studio',
            'settings': 'Settings',
            'products': 'Products',
            'roomDimensions': 'Room Dimensions',
            'width': 'Width (m)',
            'length': 'Length (m)',
            'height': 'Height (m)',
            'clearAll': 'Clear All',
            'generateReport': 'Generate Report',
            'generating': 'Generating...',
            'dragHint': 'Drag lights from the sidebar onto the canvas...'
        },
        'pdf': {
            'projectRenderings': 'Project Renderings',
            'lightingDesignReport': 'Lighting Design Report',
            'generatedOn': 'Generated on',
            'roomType': 'Room Type',
            'dimensions': 'Dimensions',
            'luminairePartsList': 'Luminaire Parts List',
            'luminaireType': 'Luminaire / Type',
            'power': 'Power',
            'cct': 'CCT',
            'reflectorFinish': 'Reflector Finish',
            'qty': 'Qty',
            'totalPower': 'Total Power',
            'totalInstalledPower': 'Total Installed Power',
            'specificConnectedLoad': 'Specific Connected Load',
            'designStatus': 'Design Status',
            'illuminanceMap': 'Illuminance Map',
            'calculationSurface': 'Calculation Surface',
            'gridSpacing': 'Grid Spacing',
            'em': 'Em',
            'emin': 'Emin',
            'emax': 'Emax',
            'u0': 'U0',
            'status': {
                'OPTIMAL': 'OPTIMAL',
                'OVERLIT': 'OVERLIT',
                'SUBOPTIMAL': 'SUBOPTIMAL',
                'POOR': 'POOR',
                'INFO': 'INFO',
                'POOR UNIFORMITY': 'POOR UNIFORMITY'
            },
            'recommender': {
                'meetsStandard': 'Your lighting design meets recommended standards.',
                'noLights': 'You have not placed any lights yet. Add fixtures to reach the target illumination.',
                'underlit': 'Your room is receiving {{lux}} lx. Recommended minimum is {{target}} lx. Consider adding more fixtures.',
                'overlitWalls': 'Your room is receiving {{lux}} lx, which is very bright for a {{room}}. Your walls are also overlit, likely due to fixtures placed too close to them. Consider reducing the number of fixtures or redirecting them away from the walls.',
                'darkWalls': 'Your room is receiving {{lux}} lx, which is very bright for a {{room}}. However, your walls remain dark. Consider reducing the number of ambient downlights and adding dedicated wall-washers or accent fixtures to balance the space.',
                'overlitGeneric': 'Your room is receiving {{lux}} lx, which is very bright for a {{room}}. Consider reducing the overall number of fixtures or lowering their intensity.',
                'mixedTempsTitle': 'Mixed Color Temperatures',
                'mixedTempsDetail': 'You are mixing warm ({{minTemp}}K) and cool ({{maxTemp}}K) lighting. For a cohesive atmosphere, consider matching color temperatures.',
                'weatherResistanceTitle': 'Weather Resistance Required',
                'weatherResistanceDetail': 'Ensure the selected fixtures are rated for outdoor use (IP54 or higher) before final installation.'
            },
            'statusMsg': {
                'ceilingInfo': 'Ceiling illuminance typically relies on indirect bounces or uplighting, which are not calculated in this direct-light simulation.',
                'significantlyBrighter': 'Surface is significantly brighter than target (~{{target}}lx). Consider reducing wattage or fixture count.',
                'meetsTarget': 'Surface meets target illuminance with acceptable uniformity.',
                'meetsAveragePoorUniformity': 'Surface meets average lux target, but has dark spots (Emin: {{emin}}lx).',
                'slightlyUnderlit': 'Surface is slightly underlit. Target is ~{{target}}lx.',
                'severelyUnderlit': 'Surface is severely underlit. Target is ~{{target}}lx.'
            }
        }
    },
    'jp': {
        'studio': {
            'title': 'Mi-KAI Light Studio',
            'settings': '設定',
            'products': '製品',
            'roomDimensions': '部屋の寸法',
            'width': '幅 (m)',
            'length': '長さ (m)',
            'height': '高さ (m)',
            'clearAll': 'すべてクリア',
            'generateReport': 'レポート生成',
            'generating': '生成中...',
            'dragHint': 'サイドバーからキャンバスにライトをドラッグしてください...'
        },
        'pdf': {
            'projectRenderings': 'プロジェクトレンダリング',
            'lightingDesignReport': '照明設計レポート',
            'generatedOn': '生成日',
            'roomType': '部屋タイプ',
            'dimensions': '寸法',
            'luminairePartsList': '照明器具部品リスト',
            'luminaireType': '照明器具 / タイプ',
            'power': '電力',
            'cct': '色温度',
            'reflectorFinish': '反射板仕上げ',
            'qty': '数量',
            'totalPower': '総電力',
            'totalInstalledPower': '総設置電力',
            'specificConnectedLoad': '接続負荷',
            'designStatus': '設計ステータス',
            'illuminanceMap': '照度マップ',
            'calculationSurface': '計算対象面',
            'gridSpacing': 'グリッド間隔',
            'em': '平均照度 (Em)',
            'emin': '最小照度 (Emin)',
            'emax': '最大照度 (Emax)',
            'u0': '均斉度 (U0)',
            'status': {
                'OPTIMAL': '最適',
                'OVERLIT': '過剰照明',
                'SUBOPTIMAL': '次善',
                'POOR': '不十分',
                'INFO': '情報',
                'POOR UNIFORMITY': '均斉度不良'
            },
            'recommender': {
                'meetsStandard': '照明設計は推奨基準を満たしています。',
                'noLights': 'まだライトが配置されていません。目標照度に到達するために器具を追加してください。',
                'underlit': '現在の照度は {{lux}} lx です。推奨最小値は {{target}} lx です。器具の追加を検討してください。',
                'overlitWalls': '現在の照度は {{lux}} lx で、{{room}} にしては非常に明るいです。器具が壁に近すぎるため、壁も過剰照明になっています。器具を減らすか、壁から離してください。',
                'darkWalls': '現在の照度は {{lux}} lx で、{{room}} にしては非常に明るいです。しかし、壁は暗いままです。全体照明を減らし、専用のウォールウォッシャーやアクセント照明を追加して空間のバランスを取ることを検討してください。',
                'overlitGeneric': '現在の照度は {{lux}} lx で、{{room}} にしては非常に明るいです。器具の全体数を減らすか、出力を下げることを検討してください。',
                'mixedTempsTitle': '混在した色温度',
                'mixedTempsDetail': '暖色 ({{minTemp}}K) と寒色 ({{maxTemp}}K) が混在しています。統一感のある空間にするために、色温度を合わせることを検討してください。',
                'weatherResistanceTitle': '耐候性が必要',
                'weatherResistanceDetail': '最終的な設置前に、選択した器具が屋外用 (IP54 以上) であることを確認してください。'
            },
            'statusMsg': {
                'ceilingInfo': '天井の照度は通常、間接反射やアッパーライトに依存しますが、この直接光シミュレーションでは計算されません。',
                'significantlyBrighter': '目標値 (~{{target}}lx) よりも大幅に明るいです。ワット数または器具数を減らすことを検討してください。',
                'meetsTarget': '許容範囲内の均斉度で目標照度を満たしています。',
                'meetsAveragePoorUniformity': '平均照度の目標は満たしていますが、暗い箇所があります (最小照度: {{emin}}lx)。',
                'slightlyUnderlit': 'やや照度不足です。目標は約 {{target}}lx です。',
                'severelyUnderlit': '著しく照度不足です。目標は約 {{target}}lx です。'
            }
        }
    },
    'cn': {
        'studio': {
            'title': 'Mi-KAI Light Studio',
            'settings': '设置',
            'products': '产品',
            'roomDimensions': '房间尺寸',
            'width': '宽度 (m)',
            'length': '长度 (m)',
            'height': '高度 (m)',
            'clearAll': '清除所有',
            'generateReport': '生成报告',
            'generating': '正在生成...',
            'dragHint': '从侧边栏将灯具拖到画布上...'
        },
        'pdf': {
            'projectRenderings': '项目渲染图',
            'lightingDesignReport': '照明设计报告',
            'generatedOn': '生成日期',
            'roomType': '房间类型',
            'dimensions': '尺寸',
            'luminairePartsList': '灯具部件清单',
            'luminaireType': '灯具 / 类型',
            'power': '功率',
            'cct': '色温',
            'reflectorFinish': '反射罩饰面',
            'qty': '数量',
            'totalPower': '总功率',
            'totalInstalledPower': '总安装功率',
            'specificConnectedLoad': '特定连接负载',
            'designStatus': '设计状态',
            'illuminanceMap': '照度图',
            'calculationSurface': '计算表面',
            'gridSpacing': '网格间距',
            'em': '平均照度 (Em)',
            'emin': '最小照度 (Emin)',
            'emax': '最大照度 (Emax)',
            'u0': '均匀度 (U0)',
            'status': {
                'OPTIMAL': '最佳',
                'OVERLIT': '过度照明',
                'SUBOPTIMAL': '次优',
                'POOR': '差',
                'INFO': '信息',
                'POOR UNIFORMITY': '均匀度差'
            },
            'recommender': {
                'meetsStandard': '您的照明设计符合推荐标准。',
                'noLights': '您尚未放置任何灯具。请添加灯具以达到目标照度。',
                'underlit': '您的房间接收到 {{lux}} lx 的照度。推荐的最低照度为 {{target}} lx。考虑增加更多灯具。',
                'overlitWalls': '您的房间接收到 {{lux}} lx 的照度，对于 {{room}} 来说非常亮。您的墙壁也过度照明，可能是因为灯具离墙太近。考虑减少灯具数量或调整灯具方向远离墙壁。',
                'darkWalls': '您的房间接收到 {{lux}} lx 的照度，对于 {{room}} 来说非常亮。但是您的墙壁仍然很暗。考虑减少环境筒灯，并添加专用的洗墙灯或重点照明灯具来平衡空间。',
                'overlitGeneric': '您的房间接收到 {{lux}} lx 的照度，对于 {{room}} 来说非常亮。考虑减少灯具总数或降低其亮度。',
                'mixedTempsTitle': '色温混合',
                'mixedTempsDetail': '您正在混合使用暖色 ({{minTemp}}K) 和冷色 ({{maxTemp}}K) 照明。为了营造协调的氛围，请考虑统一色温。',
                'weatherResistanceTitle': '需要防风雨性能',
                'weatherResistanceDetail': '在最终安装前，请确保所选灯具适合户外使用（IP54 或更高）。'
            },
            'statusMsg': {
                'ceilingInfo': '天花板照度通常依赖于间接反射或向上照明，这在直接光模拟中未进行计算。',
                'significantlyBrighter': '表面亮度明显高于目标值（约 {{target}}lx）。考虑降低瓦数或灯具数量。',
                'meetsTarget': '表面达到目标照度，均匀度可接受。',
                'meetsAveragePoorUniformity': '表面达到平均照度目标，但存在暗点（最小照度：{{emin}}lx）。',
                'slightlyUnderlit': '表面照度略显不足。目标值为约 {{target}}lx。',
                'severelyUnderlit': '表面照度严重不足。目标值为约 {{target}}lx。'
            }
        }
    }
}

base_path = '/Users/hriday/Documents/Documents/mi_kai/i18n'
for lang in langs:
    filepath = os.path.join(base_path, f'{lang}.json')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = json.load(f)
    
    content['studio'] = data[lang]['studio']
    content['pdf'] = data[lang]['pdf']
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(content, f, ensure_ascii=False, indent=2)

print("Injected translations successfully!")
