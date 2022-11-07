function doDrop(event)
{
  let dt = event.dataTransfer;
  dt.items[0].getAsFile().text().then((data) => console.log(data));
}

for (a of document.getElementsByClassName('drop_target')) {
    a.addEventListener('drop', event => {
        event.stopPropagation();
        event.preventDefault();
        doDrop(event);
    });
    a.addEventListener('dragenter', event => {
        event.stopPropagation();
        event.preventDefault();
    });
    a.addEventListener('dragover', event => {
        event.stopPropagation();
        event.preventDefault();
    })
}

let ons2ua = {
    'W06000001':'Isle of Anglesey',
    'W06000002':'Gwynedd',
    'W06000003':'Conwy',
    'W06000004':'Denbighshire',
    'W06000005':'Flintshire',
    'W06000006':'Wrexham',
    'W06000023':'Powys',
    'W06000008':'Ceredigion',
    'W06000009':'Pembrokeshire',
    'W06000010':'Carmarthenshire',
    'W06000011':'Swansea',
    'W06000012':'Neath Port Talbot',
    'W06000013':'Bridgend',
    'W06000014':'Vale of Glamorgan',
    'W06000015':'Cardiff',
    'W06000016':'Rhondda Cynon Taf',
    'W06000024':'Merthyr Tydfil',
    'W06000018':'Caerphilly',
    'W06000019':'Blaenau Gwent',
    'W06000020':'Torfaen',
    'W06000021':'Monmouthshire',
    'W06000022':'Newport'
};

let width = d3.select('#choro').node().clientWidth;
let height = d3.select('#choro').node().clientHeight;

let choro_svg = d3.select('#choro').append('svg').attr("width",width).attr('height', height);
let hex_svg = d3.select('#hex').append('svg').attr("width", width).attr('height', height);

let projection = d3.geoMercator();
let path = d3.geoPath().projection(projection);

let active = [d3.select(null), d3.select(null)];

let choromap = undefined;
let hexmap = undefined;

let margin = {
    top: 30,
    bottom: 30,
    left: 30,
    right: 30
};

function reset(event, d) {
    active.forEach(a => a.attr('opacity', '1.0'));
    active.forEach(a => a.attr('fill', '#ccc'));
    active =[d3.select(null), d3.select(null)];

    d3.select('.info').classed('active', false);
}

function clicked(event, d) {
    console.log(this);
    if(active[0].node() === this || active[1].node() === this) {
        reset(event, d);
    } else {
        active.forEach(a => a.attr('opacity', '1.0'));
        active.forEach(a => a.attr('fill', '#ccc'));
        active[0] = d3.select(this);
        let ons_code = this.id.slice(this.id.indexOf('-')+1);
        active[1] = d3.select(this.id.includes('choro') ? `#hex-${ons_code}` : `#choro-${ons_code}`)
        active.forEach(a => a.attr('opacity', '0.2'));
        active.forEach(a => a.attr('fill', 'steelblue'));

        d3.select(".info").classed("active", true);

        d3.select('#ua_name').text(ons2ua[ons_code]);
        d3.select('#ua_ons_cd').text(ons_code);
    }
}

Promise.all([
    d3.json('maps/wales_ua.topojson'),
    d3.json('maps/wales_ua.hexjson')
]).then(([ua_boundaries, ua_hexes]) => {

    let ua_choro = topojson.feature(ua_boundaries, ua_boundaries.objects.wales_ua);

    projection.fitSize([width, height], ua_choro);

    choromap = choro_svg.selectAll('path')
        .data(ua_choro.features)
        .join((enter) => {
            enter.append('path')
            .attr('d', path)
            .attr('fill', '#ccc' )
            .attr('id', d => `choro-${d.properties.CTYUA21CD}`)
            .attr('stroke', '#eee')
            .attr('stroke-width', '1px')
            .on('click', clicked);
        });

    ua_hexes = d3.renderHexJSON(ua_hexes, width-margin.left-margin.right, height-margin.top-margin.bottom);
    hexmap = hex_svg.selectAll('g')
        .data(ua_hexes)
        .join((enter) => {
            enter.append('g')
                .attr('transform', (hex) => {
                    return `translate(${hex.x+margin.left},${hex.y+margin.top})`;
                })
                .append('polygon')
                .attr('points', (hex) => hex.points)
                .attr('stroke', '#eee')
                .attr('fill', '#ccc')
                .attr('stroke-width', 2)
                .attr('id', (hex) => `hex-${hex.CTYUA21CD}`)
                .attr('data-name', (hex) => hex.name)
                .on('click', clicked);
        });
});