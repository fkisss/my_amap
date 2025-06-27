---

# AI编写的高德JSAPI地图

## 项目简介

本项目基于高德地图 JSAPI，集成了多条自定义线路、景点标注、智能位置搜索、驾车/公交/步行路径规划等功能，适合自驾/骑行/徒步线路展示与导航体验。

## 主要功能

- **多条自定义线路展示**：自动加载 `ditu/chuanzangnanxian.xml` 等 XML 路线文件，支持大规模轨迹渲染。
- **景点批量标注**：自动加载 `ditu/jingdian.md`，在地图上批量显示景点及名称。
- **智能位置搜索**：支持地名/地址模糊搜索，点击结果可一键设为起点/终点。
- **路径规划与导航**：支持驾车、公交、步行三种方式，支持右键地图设起点/终点/途径点，自动显示距离与时间。
- **界面美观自适应**：搜索与导航面板风格统一，按钮美观，支持响应式布局。

## 文件结构

```
.
├── index.html                # 主地图页面
├── ditu/
│   ├── chuanzangnanxian.xml  # 路线数据（XML格式，支持大规模轨迹）
│   ├── ceshi.xml             # 其它路线示例
│   └── jingdian.md           # 景点批量标注数据
└── ...                       # 其它备份/测试页面
```

## 快速使用

1. **本地启动服务**  
   推荐用 Python 启动本地服务（否则部分资源无法加载）：
   ```bash
   python -m http.server 8000
   ```
   然后浏览器访问 [http://localhost:8000/mymap.html](http://localhost:8000/mymap.html)

2. **自定义路线与景点**  
   - 路线：在 `ditu/` 目录下添加/替换 XML 文件，并在 `mymap.html` 的 `xmlFileList` 变量中配置路径和样式。
   - 景点：编辑 `ditu/jingdian.md`，每行格式为 `名称,经度,纬度`。

3. **获取xml文件方法**  
   获取起始点坐标，替换下面页面的坐标，浏览器打开，复制以后另存为即可。
   https://restapi.amap.com/v3/direction/driving?origin=103.474183,30.398535&destination=99.012025,29.764587&waypoints=101.808713,30.071335&extensions=base&output=xml&key=dcd5708fb7a99a54a3608ad1183f45bb

4. **API Key 配置**  
   - 请在 `mymap.html` 中将高德地图 API Key 替换为你自己的（`<script src=\"https://webapi.amap.com/maps?...&key=你的Key...`）。

## 注意事项

- **大文件消耗**  
  如 `chuanzangnanxian.xml` 较大（约660KB/1万点），现代浏览器可流畅加载，但移动端或低配电脑建议适当精简轨迹点。
- **安全密钥**  
  请妥善保管高德 API Key 和安全码，避免泄露。

## 常见问题

- **地图/轨迹不显示？**  
  请确保本地用 http 服务访问，且 API Key 正确。
- **导航不准确？**  
  搜索结果设为终点时，优先使用括号内坐标，避免地名歧义。


---
