Place the hero image you attached to the chat here as `hero.jpg` so the homepage displays it behind the welcome text.

Preferred filename and path:
  public/images/hero.jpg

If you downloaded the image to your Downloads folder, you can run this PowerShell command from your project root (adjust the source path if needed):

# Move the downloaded image into the project images folder
Move-Item -Path "$env:USERPROFILE\Downloads\hero.jpg" -Destination "public\images\hero.jpg"

If the downloaded file has a different name (for example `download.jpg`), rename while moving:

Move-Item -Path "$env:USERPROFILE\Downloads\download.jpg" -Destination "public\images\hero.jpg"

Or, if you prefer copy instead of move:

Copy-Item -Path "$env:USERPROFILE\Downloads\hero.jpg" -Destination "public\images\hero.jpg"

After placing the file, open `public/index.html` in your browser or run a local server. Example using Python (from project root):

# Start a simple local server on port 8000 (Python 3)
python -m http.server 8000

Then open http://localhost:8000/public/index.html in your browser.

Notes:
- The page already references the background image at `images/hero.jpg` (see inline CSS in `public/index.html`).
- If the image isn't present, the hero will fall back to the dark overlay gradient, so the site remains readable.
- If you'd like, tell me the filename you saved and I can move/rename it for you (if you give me the exact path).