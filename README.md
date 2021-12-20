# about
[關於此計畫](https://seedingfuture.travel.blog/)
* 程式授權：GNU GPL V3
* 文字、圖像內容授權：CC-BY 4.0

# 檔案結構
* 程式使用python3 flask做框架
* 來源圖片放置於 static/source
* 背景圖片放置於 static/source/bg
* 程式於執行時會自動產生thumb縮圖

# 來源分類
* 修改 static/source/category.json 即可

# how to run
1. 建立python3 virtual enviroment
2. 設置好DATABASE_URL環境變數和config.py
3.
```bash
pip3 install -r requirement.txt
python3 app.py
```

# 流程圖
![seedingfuture運作流程](https://user-images.githubusercontent.com/12148555/146792598-362cb447-5358-4081-8a7a-ab9aa6bcf6b2.jpg)
