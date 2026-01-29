import os
import shutil

print("Cleaning up backend directory...")

# Files to delete
files_to_delete = [
    "train_fracture_model.py",  # Old training script that didn't work
]

# Directories to delete
dirs_to_delete = [
    "__pycache__",  # Python cache directory
]

# Delete files
for file in files_to_delete:
    if os.path.exists(file):
        os.remove(file)
        print(f"✓ Deleted file: {file}")
    else:
        print(f"- File not found: {file}")

# Delete directories
for dir_name in dirs_to_delete:
    if os.path.exists(dir_name):
        shutil.rmtree(dir_name)
        print(f"✓ Deleted directory: {dir_name}")
    else:
        print(f"- Directory not found: {dir_name}")

print("\n" + "="*50)
print("CLEANUP COMPLETE!")
print("="*50)
print("Remaining files:")

# List remaining files
for item in sorted(os.listdir(".")):
    if os.path.isfile(item):
        size = os.path.getsize(item)
        print(f"  📄 {item} ({size:,} bytes)")
    else:
        print(f"  📁 {item}/")

print("\nBackend directory is now clean and optimized!")
