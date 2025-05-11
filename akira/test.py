import requests
from PIL import Image
from io import BytesIO

def lookup_product(barcode):
    url = f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        if data.get("status") == 1:
            product = data["product"]
            name = product.get('product_name', 'N/A')
            brand = product.get('brands', 'N/A')
            categories = product.get('categories', 'N/A')
            quantity = product.get('quantity', 'N/A')
            image_url = product.get('image_url')

            print(f"Product Name: {name}")
            print(f"Brand: {brand}")
            print(f"Categories: {categories}")
            print(f"Quantity: {quantity}")
            print(f"Image URL: {image_url}")

            if image_url:
                image_response = requests.get(image_url)
                if image_response.status_code == 200:
                    img = Image.open(BytesIO(image_response.content))
                    img.show()
                else:
                    print("Could not load image.")
            else:
                print("No image available.")
        else:
            print("Product not found.")
    else:
        print(f"Error: {response.status_code}")

# Example usage
lookup_product("737628064502")
