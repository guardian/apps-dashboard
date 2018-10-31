#!/bin/bash -x

TAGS=$(git tag -l --sort=-refname "7.*-*" "6.*-*" | grep -o '[6,7]\.[0-9]*' | uniq | xargs -I {} sh -c 'git tag -l --sort=-refname "{}-*" | head -1')

echo -e "$TAGS" | sed 'p;1d;$d' | xargs -n 2 ./ios-live.sh

cat > index.html <<EOF
<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    <style>iframe{width: 1px;min-width: 100%;border-width:0px;}</style>

    <title>Release notes</title>
  </head>
  <body>
    <main role="main" class="container">
      <h1 class="mt-5">App Store versions changelog</h1>

      $(echo -e "$TAGS" | sed '$d' | xargs -I{} echo '<iframe src="release/{}.html"></iframe>')

    </main>

    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.6.2/iframeResizer.min.js"></script>
    <script>iFrameResize({heightCalculationMethod:"max"})</script>
  </body>
</html>
EOF
