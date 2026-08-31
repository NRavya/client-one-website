import os

image_dir = r'E:\project - client 01\image assets\client one'
extensions = ['.png', '.jfif', '.avif', '.jpg', '.jpeg']

# Walk recursively and delete image files
for root, dirs, files in os.walk(image_dir):
    for f in files:
        if any(f.lower().endswith(ext) for ext in extensions):
            filepath = os.path.join(root, f)
            os.remove(filepath)
            print(f'Deleted: {filepath}')

print('Done')