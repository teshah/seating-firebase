@REM Command to convert a regular image to a 32x32 icon.
@REM Replace 'input_image.png' with the actual name of your source image file.
@REM Replace 'output_icon.ico' with your desired output icon filename.
@REM Ensure ImageMagick is installed and in your Windows PATH.

magick circular_icons\icon-32x32.png -resize 32x32 favicon.ico

@REM --- Explanation of the command ---
@REM magick:          The ImageMagick command-line tool (use 'convert' for older versions).
@REM input_image.png: Your source image file (e.g., myphoto.jpg, logo.png, graphic.gif).
@REM                  ImageMagick supports many formats.
@REM -resize 32x32:   This option resizes the image.
@REM                  '32x32' specifies the target width and height in pixels.
@REM                  ImageMagick will by default try to maintain the aspect ratio.
@REM                  If you want to force the exact dimensions and don't mind
@REM                  potential distortion, you can add an exclamation mark: '-resize 32x32!'
@REM output_icon.ico: The name of the output icon file. Using the '.ico' extension
@REM                  tells ImageMagick to convert the image to the ICO format.
