// utitliy functions

// Locked diagrams
var lockedElements = [];

// plotted diagrams
var lockableElements = [];

//====================================================================

function downloadJSON(data, fileName="data.tsv", exclude=["Selected", "Id", "Edited"]) {
    var  columns = [...new Set(data.reduce((r, e) => [...r, ...Object.keys(e)], []))];
    var tsv = d3.tsvFormat(data, columns.filter(s => exclude.indexOf(s) === -1));
    var downloadLink = document.createElement("a");
    var blob = new Blob(["\ufeff", tsv]);
    var url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

//====================================================================
function DOILink(doi) {
    return doi ? '<a href="https://dx.doi.org/' + doi + '" target="_blank">' + doi + '</a>' : '';
}

function mailLink(samplename, mail, text) {
    return mail ? '<a href=mailto:' + mail + "?Subject=EMPD%20sample%20" + samplename + '>' + text + '</a>' : '';
}

//====================================================================

function formatNumberLength(num, length) {
    // Copied from https://stackoverflow.com/a/1127966
    var r = "" + num;
    while (r.length < length) {
        r = "0" + r;
    }
    return r;
}


function wrap(text) {
    // Copied from https://bl.ocks.org/ericsoco/647db6ebadd4f4756cae
    // on October 4th, 2018

    var width=120;

  text.each(function() {

    var breakChars = ['/', '&', '-'],
      text = d3.select(this),
      textContent = text.text(),
      spanContent;

    breakChars.forEach(char => {
      // Add a space after each break char for the function to use to determine line breaks
      textContent = textContent.replace(char, char + ' ');
    });

    var words = textContent.split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      x = text.attr('x') || 0,
      y = text.attr('y'),
      dy = parseFloat(text.attr('dy') || 0),
      tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        spanContent = line.join(' ');
        breakChars.forEach(char => {
          // Remove spaces trailing breakChars that were added above
          spanContent = spanContent.replace(char + ' ', char);
        });
        tspan.text(spanContent);
        line = [word];
        tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
      }
    }
  });

}

//====================================================================

function highlightDisplayed() {
    d3.selectAll(".dc-table-row")
        .style("font-weight", "normal")
        .style("background", "#eee");

    if (displayedId > -1) {
        d3.selectAll(".dc-table-column._1")
            .text(function (d, i) {
                    if (parseInt(d.Id) == displayedId) {
                    this.parentNode.scrollIntoView();
                    d3.select(this.parentNode)
                        .style("font-weight", "bold")
                        .style("background", "#ccc");
                    document.getElementById('wrap').scrollIntoView();
                        }
                    return d.Id;
                });
    }
}

function lockableElement(parent, entity, siteName) {
    var parentElem = document.getElementById(parent);
    var elemId = `${parent}-${entity}`
    if (lockableElements.includes(elemId)) {
        document.getElementById(elemId).scrollIntoView();
        return "";
    }
    parentElem.insertAdjacentHTML("afterbegin", `
        <ul class="list-inline list-group" id=${elemId}-title>
            <li>
                <button onclick='lockElement("${elemId}")' role="button" class="list-group-item" id="${elemId}-btn" title="Pin this Element"><span class="glyphicon glyphicon-lock" aria-hidden="true"></span></button>
            </li>
            <li>
                <h4 style="text-align:center;">${siteName} (${entity})</h4>
            </li>
        </ul>
        <br>
        <div id=${elemId}>
        </div>`);
    lockableElements.push(elemId)
    return elemId;
}

function lockElement(elemId) {
    if (!lockedElements.includes(elemId)) {
        lockedElements.push(elemId);
    } else {
        lockedElements = lockedElements.filter(s => s != elemId);
    }
    $('#' + elemId + '-btn').button('toggle');
}

function removeUnlocked() {
    lockableElements.filter(
        elemId => !lockedElements.includes(elemId)).forEach(
            function(elemId) {
                document.getElementById(elemId).remove();
                document.getElementById(`${elemId}-title`).remove();
            });
    lockableElements = lockableElements.filter(elemId => lockedElements.includes(elemId));
}

// ==================================================================

function jsonCopy(src) {
  return JSON.parse(JSON.stringify(src));
}
