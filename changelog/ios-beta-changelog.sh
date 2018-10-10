#!/bin/bash -x

LATEST_APP_STORE_VERSION=$(git tag -l --sort=-refname "7.[0-9]" "6.[0-9]" | head -n 1)
TAGS=$(git tag -l --sort=-refname --contains $LATEST_APP_STORE_VERSION | sed '$d')

echo -e "master\n$TAGS" | sed 'p;1d;$d' | xargs -n 2 ./ios-live.sh

cat > index.html <<EOF
<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    <script>
      function resize() {
        Array.from(document.getElementsByClassName('iframe')).forEach(iframe => {
          iframe.setAttribute('height', parseInt(iframe.contentWindow.document.body.scrollHeight)+75)
        })
      }
    </script>

    <title>Release notes</title>
  </head>
  <body>
    <main role="main" class="container">
      <h1 class="mt-5">Beta changelog</h1>

<div class="row">
    <div class="col-md-12">
      $(echo -e "master\n$TAGS" | sed '$d' | xargs -I{} echo '<iframe src="{}.html" class="iframe" onload="resize();" frameborder=0 scrolling="yes" width="100%" "></iframe>')
    </div>
</div>

    </main>

    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
  </body>
</html>
EOF
