function save(filename, data) {
    var blob = new Blob([data], { type: "text/csv" });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

var seed = 1;
function random() { var x = Math.sin(seed) * 10000; seed += 1; return x - Math.floor(x); }
function rbool() { return random() > 0.5; }

function $(id) { return document.getElementById(id); }
function update_range(id) { $("_" + id).value = $(id).value + (id === "seed" ? "" : "%"); update(); }
function update_text(id) { let val = parseFloat($("_" + id).value); if (!isNaN(val)) { $(id).value = val; } update_range(id); }

var a, b, c, d, e, tabSize, taboffset, jitter, flip, xi, yi, xn, yn, vertical, offset, width, height, radius;

function uniform() { var r = random(); return -jitter + r * (jitter * 2); }
function first() { e = uniform(); next(); }
function next() { var flipold = flip; flip = rbool(); a = (flip == flipold ? -e : e); b = uniform(); c = uniform(); d = uniform(); e = uniform(); }
function sl() { return vertical ? height / yn : width / xn; }
function sw() { return vertical ? width / xn : height / yn; }
function ol() { return offset + sl() * (vertical ? yi : xi); }
function ow() { return offset + sw() * (vertical ? xi : yi); }
function l(v) { var ret = ol() + sl() * v; return Math.round(ret * 100) / 100; }
function w(v) { var ret = ow() + sw() * v * (flip ? -1.0 : 1.0); return Math.round(ret * 100) / 100; }
// function p0l() { return l(0.0); }
// function p0w() { return w(0.0); }
// function p1l() { return l(0.2); }
// function p1w() { return w(a); }
// function p2l() { return l(0.5 + b + d); }
// function p2w() { return w(-tabSize + c); }
// function p3l() { return l(0.5 - tabSize + b); }
// function p3w() { return w(tabSize + c); }
// function p4l() { return l(0.5 - 2.0 * tabSize + b - d); }
// function p4w() { return w(3.0 * tabSize + c); }
// function p5l() { return l(0.5 + 2.0 * tabSize + b - d); }
// function p5w() { return w(3.0 * tabSize + c); }
// function p6l() { return l(0.5 + tabSize + b); }
// function p6w() { return w(tabSize + c); }
// function p7l() { return l(0.5 + b + d); }
// function p7w() { return w(-tabSize + c); }
// function p8l() { return l(0.8); }
// function p8w() { return w(e); }
// function p9l() { return l(1.0); }
// function p9w() { return w(0.0); }

function gen_tab(x, y, isVertical = false) {
    let xSize = width / xn;
    let ySize = height / yn;
    let xOffset = offset + xSize * x;
    let yOffset = offset + ySize * y;

    const lValue = (value) => {
        let result = isVertical ? yOffset + value * ySize : xOffset + value * xSize;
        return Math.round(result * 100) / 100;
    }

    const wValue = (value) => {
        let reverse = flip ? -1.0 : 1.0;
        let result = isVertical ? xOffset + value * xSize * reverse : yOffset + value * ySize * reverse;
        return Math.round(result * 100) / 100;
    }

    var result = "";

    if (x === 0 || y === 0) {
        first();
        result = "M " + xOffset + " " + yOffset + " ";
    }

    // There are 3 curves to a tab, each curve is defined by 3 points but we only need to provide 2 because the first point is the current position
    let points = [];
    var xDisplace = taboffset;
    // xDisplace = (xDisplace > 0.65 || xDisplace < 0.35) ? 0.5 : xDisplace;

    // First curve
    points.push({x: lValue(xDisplace + b + d), y: wValue(-tabSize + c)});
    points.push({x: lValue(xDisplace - tabSize + b), y: wValue(tabSize + c)});
    // Second curve
    points.push({x: lValue(xDisplace + 2.0 * tabSize + b - d), y: wValue(3.0 * tabSize + c)});
    points.push({x: lValue(xDisplace + tabSize + b), y: wValue(tabSize + c)});
    // Third curve
    points.push({x: lValue(0.8), y: wValue(e)});
    points.push({x: lValue(1.0), y: wValue(0.0)});

    for( var idx = 0; idx < points.length; ++idx){
        if(idx % 2 === 0) {
            result += "S ";
        }

        var xVal = isVertical ? points[idx].y : points[idx].x;
        var yVal = isVertical ? points[idx].x : points[idx].y;

        result += xVal + " " + yVal + " ";
    }

    return result;
}

function gen_d() {
    var str = "";

    seed = parseInt($("seed").value);
    tabSize = parseFloat($("tabsize").value) / 200.0;
    taboffset = parseFloat($("taboffset").value) / 100.0;
    jitter = parseFloat($("jitter").value) / 100.0;
    xn = parseInt($("xn").value);
    yn = parseInt($("yn").value);

    // Draw horizontal lines
    vertical = 0;
    for (yi = 1; yi < yn; ++yi) {
        xi = 0;
        //   first();
        //   str += "M " + p0l() + "," + p0w() + " ";
        for (; xi < xn; ++xi) {
            str += gen_tab(xi, yi);
            //  str += "C " + p1l() + " " + p1w() + " " + p2l() + " " + p2w() + " " + p3l() + " " + p3w() + " ";
            //  str += "C " + p4l() + " " + p4w() + " " + p5l() + " " + p5w() + " " + p6l() + " " + p6w() + " ";
            //  str += "C " + p7l() + " " + p7w() + " " + p8l() + " " + p8w() + " " + p9l() + " " + p9w() + " ";
            //  str += "S " + p2l() + " " + p2w() + " " + p3l() + " " + p3w() + " ";
            //  str += "S " + p5l() + " " + p5w() + " " + p6l() + " " + p6w() + " ";
            //  str += "S " + p8l() + " " + p8w() + " " + p9l() + " " + p9w() + " ";
            next();
        }
    }

    // Draw vertical lines
    vertical = 1;
    for (xi = 1; xi < xn; ++xi) {
        yi = 0;
        //   first();
        //   str += "M " + p0w() + "," + p0l() + " ";
        for (; yi < yn; ++yi) {
            str += gen_tab(xi, yi, true);
            //  str += "C " + p1w() + " " + p1l() + " " + p2w() + " " + p2l() + " " + p3w() + " " + p3l() + " ";
            //  str += "C " + p4w() + " " + p4l() + " " + p5w() + " " + p5l() + " " + p6w() + " " + p6l() + " ";
            //  str += "C " + p7w() + " " + p7l() + " " + p8w() + " " + p8l() + " " + p9w() + " " + p9l() + " ";
            //  str += "S " + p2w() + " " + p2l() + " " + p3w() + " " + p3l() + " ";
            //  str += "S " + p5w() + " " + p5l() + " " + p6w() + " " + p6l() + " ";
            //  str += "S " + p8w() + " " + p8l() + " " + p9w() + " " + p9l() + " ";
            next();
        }
    }

    // Draw border
    str += "M " + (offset + radius) + " " + (offset) + " ";
    str += "L " + (offset + width - radius) + " " + (offset) + " ";
    str += "A " + (radius) + " " + (radius) + " 0 0 1 " + (offset + width) + " " + (offset + radius) + " ";
    str += "L " + (offset + width) + " " + (offset + height - radius) + " ";
    str += "A " + (radius) + " " + (radius) + " 0 0 1 " + (offset + width - radius) + " " + (offset + height) + " ";
    str += "L " + (offset + radius) + " " + (offset + height) + " ";
    str += "A " + (radius) + " " + (radius) + " 0 0 1 " + (offset) + " " + (offset + height - radius) + " ";
    str += "L " + (offset) + " " + (offset + radius) + " ";
    str += "A " + (radius) + " " + (radius) + " 0 0 1 " + (offset + radius) + " " + (offset) + " ";
    return str;
}

function update() {
    width = parseInt($("width").value);
    height = parseInt($("height").value);
    radius = parseFloat($("radius").value);
    var ratio = 1.0 * width / height;
    if (ratio > 1.5) {
        radius = radius * 900 / width;
        width = 900;
        height = width / ratio;
    }
    else {
        radius = radius * 600 / height;
        height = 600;
        width = height * ratio;
    }
    $("puzzlecontainer").setAttribute("width", width + 11);
    $("puzzlecontainer").setAttribute("height", height + 11);
    offset = 5.5;
    $("puzzlepath").setAttribute("d", gen_d());
}

function generate() {
    width = parseInt($("width").value);
    height = parseInt($("height").value);
    radius = parseFloat($("radius").value);
    offset = 0.0;

    var data = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.0\" ";
    data += "width=\"" + width + "mm\" height=\"" + height + "mm\" viewBox=\"0 0 " + width + " " + height + "\">";
    data += "<path fill=\"none\" stroke=\"black\" stroke-width=\"0.1\" d=\"";
    data += gen_d();
    data += "\"></path></svg>";

    save("jigsaw.svg", data);
}
