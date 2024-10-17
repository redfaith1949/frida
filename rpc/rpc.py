import os
import requests

# 下载 JSON 数据的 URL
url = "http://127.0.0.1:8000/download-images/"

# 目标文件夹，用于保存下载的图片
images_folder = "images"

# 创建文件夹（如果不存在）
if not os.path.exists(images_folder):
    os.makedirs(images_folder)

# 请求 JSON 数据
response = requests.get(url)

# 确保请求成功
if response.status_code == 200:
    # 将返回的 JSON 数据转化为 Python 对象
    data = response.json()

    # 遍历每个对象
    for item in data:
        # 获取图片名称和封面图片链接
        name = item['name']
        image_url = item['cover']

        # 获取图片文件名
        image_name = name + ".jpg"
        image_path = os.path.join(images_folder, image_name)

        # 下载图片并保存
        print(f"Downloading {image_url} to {image_path}")
        img_data = requests.get(image_url).content
        with open(image_path, 'wb') as handler:
            handler.write(img_data)

    print("所有图片下载完成。")
else:
    print(f"无法获取数据, 状态码: {response.status_code}")
