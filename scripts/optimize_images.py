import os
import sys
from PIL import Image

def optimize_images(directory, quality=85, convert_to_webp=True, max_width=1920):
    """
    Optimizes images in a directory recursively.
    """
    supported_formats = ('.jpg', '.jpeg', '.png')
    
    if not os.path.exists(directory):
        print(f"Directory {directory} does not exist.")
        return

    for root, dirs, files in os.walk(directory):
        # Skip hidden directories like .git
        if '.git' in dirs:
            dirs.remove('.git')
            
        for filename in files:
            if filename.lower().endswith(supported_formats):
                filepath = os.path.join(root, filename)
                try:
                    with Image.open(filepath) as img:
                        orig_size = os.path.getsize(filepath)
                        
                        # Resize if too large
                        if img.width > max_width:
                            ratio = max_width / float(img.width)
                            new_height = int(float(img.height) * float(ratio))
                            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                        
                        # Determine output path and format
                        if convert_to_webp:
                            output_path = os.path.splitext(filepath)[0] + ".webp"
                            img.save(output_path, "WEBP", quality=quality)
                            new_size = os.path.getsize(output_path)
                            print(f"Optimized: {filepath} -> {output_path} ({orig_size} -> {new_size} bytes)")
                        else:
                            output_path = filepath
                            # Save in original format with optimization
                            if filename.lower().endswith('.png'):
                                img.save(output_path, optimize=True)
                            else:
                                img.save(output_path, quality=quality, optimize=True)
                            new_size = os.path.getsize(output_path)
                            print(f"Optimized: {filepath} ({orig_size} -> {new_size} bytes)")
                            
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    # Default directory is current directory or provided as argument
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    optimize_images(target_dir)
