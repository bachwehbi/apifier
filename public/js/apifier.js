$(document).ready(function() {
  var parser = Parser;
  var oldInput                    = null;
  var oldParserVar                = null;

    var editor = CodeMirror.fromTextArea(document.getElementById("grammar"), {
      lineNumbers: true,
      mode: "javascript",
      lineWrapping: true,
      matchBrackets: true,
      theme : 'cobalt'
    });

        function buildErrorMessage(e) {
    return e.line !== undefined && e.column !== undefined
      ? "Line " + e.line + ", column " + e.column + ": " + e.message
      : e.message;
  }
  
  function parse() {
    oldInput = $("#input").val();
    oldParserVar                = $("#parser-var").val();

    $("#grammar").addClass("disabled").text("Output not available.");
    $("#parser-var").attr("disabled", "disabled");
    $("#parser-download").addClass("disabled");
    
    var result;

    try {
      var output = parser.parse($("#input").val());
      output.appname = $("#parser-var").val();
      console.log(generateAPI(output));
//      $("#grammar").removeClass("disabled").text(jsDump.parse(output));
      $("#grammar").removeClass("disabled").text(generateAPI(output));
      
      editor.setValue(generateAPI(output));
      
      var parserUrl = "data:text/plain;charset=utf-8;base64,"
        + Base64.encode(generateAPI(output) + ";\n");
      $("#parse-message")
        .attr("class", "message info")
        .text("Code Generated Successfully.");

      $("#parser-var").removeAttr("disabled");
      $("#parser-download").removeClass("disabled").attr("href", parserUrl);

      var result = true;
    } catch (e) {
      $("#parse-message").attr("class", "message error").text(buildErrorMessage(e));

      var result = false;
    }

    doLayout();
    return result;
  }

  function scheduleParse() {
    if (($("#input").val() === oldInput) && ($("#parser-var").val() === oldParserVar)) { return; }

    parseTimer = setTimeout(function() {
      parse();
      parseTimer = null;
    }, 500);
  }

  function doLayout() {
    /*
     * This forces layout of the page so that the |#columns| table gets a chance
     * make itself smaller when the browser window shrinks.
     */
    if ($.browser.msie || $.browser.opera) {
      $("#left-column").height("0px");
      $("#right-column").height("0px");
    }
    $("#input").height("0px");

    if ($.browser.msie || $.browser.opera) {
      $("#left-column").height(($("#left-column").parent().innerHeight() - 2) + "px");
      $("#right-column").height(($("#right-column").parent().innerHeight() - 2) + "px");
    }

    $("#input").height(($("#input").parent().parent().innerHeight() - 14) + "px");
    $("#grammar").height(($("#grammar").parent().parent().innerHeight() - 14) + "px");
    $(".CodeMirror").height(($("#grammar").parent().parent().innerHeight() - 14) + "px");
  }

  $("#input, #parser-var")
    .change(scheduleParse)
    .mousedown(scheduleParse)
    .mouseup(scheduleParse)
    .click(scheduleParse)
    .keydown(scheduleParse)
    .keyup(scheduleParse)
    .keypress(scheduleParse);

  doLayout();
  $(window).resize(doLayout);

  $("#loader").hide();
  $("#content").show();

  $("#grammar, #parser-var").removeAttr("disabled");

  parse();
});
