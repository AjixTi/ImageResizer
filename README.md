# ImageResizer

png-resizer-electron/
├── package.json
├── electron/
│   ├── main.js            # Electronのエントリポイント
│   ├── preload.js         # レンダラープロセスとメインプロセス間の通信
│   └── handlers/
│       ├── fileHandler.js  # ファイル操作関連の処理
│       ├── configHandler.js # 設定ファイル読み込み処理
│       ├── imageHandler.js  # 画像処理関連
│       └── syncHandler.js   # ファイル同期処理
├── src/
│   ├── App.js             # メインのReactコンポーネント
│   ├── index.js           # Reactのエントリポイント
│   ├── components/
│   │   ├── ConfigPanel.js  # 設定パネル
│   │   ├── ImageList.js    # 画像リスト表示
│   │   ├── ResizePanel.js  # リサイズパネル
│   │   └── SyncPanel.js    # 同期パネル
│   └── styles/
│       └── App.css         # スタイル定義
├── public/
│   ├── index.html
│   └── electron.js        # 開発用Electron起動スクリプト
└── config.ini              # デフォルト設定ファイル