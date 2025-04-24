import os

def read_file_content(file_path):
    """
    Read the content of a file.
    
    Args:
        file_path (str): Path to the file
        
    Returns:
        str: Content of the file or error message
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        return f"Error reading file: {e}"

def list_files_recursive(directory, output_file):
    """
    Recursively lists all files in a directory and writes their content to a text file.
    
    Args:
        directory (str): The directory to traverse
        output_file (file): The open file to write to
    """
    for root, dirs, files in os.walk(directory):
        # Print the current directory path
        output_file.write(f"Directory: {root}\n")
        
        # Process each file in the directory
        for file in files:
            file_path = os.path.join(root, file)
            output_file.write(f"\n--- FILE: {file_path} ---\n")
            
            # Read and write the file content
            content = read_file_content(file_path)
            output_file.write(content)
            output_file.write("\n\n" + "="*80 + "\n\n")

def main():
    # Directories to scan
    directories = [
        "/home/ayes/water-quality-monitor/frontend/components",
        "/home/ayes/water-quality-monitor/frontend/pages"
    ]
    
    # Output file
    output_file_path = "files_content.txt"
    
    # Open the output file
    with open(output_file_path, "w", encoding='utf-8') as output_file:
        output_file.write("Files Content\n")
        output_file.write("=============\n\n")
        
        # Process each directory
        for directory in directories:
            output_file.write(f"SCANNING: {directory}\n")
            output_file.write("="*80 + "\n\n")
            
            if os.path.exists(directory):
                list_files_recursive(directory, output_file)
            else:
                output_file.write(f"Directory not found: {directory}\n\n")
        
        output_file.write("End of content listing\n")
    
    print(f"Files content has been saved to {output_file_path}")

if __name__ == "__main__":
    main()