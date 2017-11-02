/* GLOB VAR */
var allOrg = [];
var datatableTop;
var datatableFame;

/* CONFIG */
var maxRank = 16;
var popOverOption = {
    trigger: "hover",
    html: true,
    placement: 'bottom',
    content: generateRankingSheet()
}
var optionsLineChart = {
    series: {
            shadowSize: 0 ,
            lines: {
                fill: true,
                fillColor: {
                    colors: [ { opacity: 1 }, { opacity: 0.1 } ]
                }
            }
    },
    points: { show: true },
    lines: { show: true, fill: true },
    grid: {
        tickColor: "#dddddd",
        borderWidth: 0
    },
    legend: {
        show: true,
        position: "nw"
    }
};
var optionDatatable_light = {
    responsive: true,
    searching: false,
    ordering: false,
    scrollY:        '30vh',
    scrollCollapse: true,
    paging:         false,
    "language": {
        "lengthMenu": "",
        "info": "",
        "infoFiltered": "",
        "infoEmpty": "",
    },
    "info": false,
};
var optionDatatable_top = jQuery.extend({}, optionDatatable_light)
var optionDatatable_last = jQuery.extend({}, optionDatatable_light)
var optionDatatable_fame = jQuery.extend({}, optionDatatable_light)
optionDatatable_fame.scrollY = '50vh';

var optionDatatable_Categ = {
    responsive: true,
    searching: true,
    scrollY:        '39vh',
    scrollCollapse: true,
    paging:         false,
    "info": false,
};

var typeaheadOption = {
    source: function (query, process) {
        if (allOrg.length == 0) { // caching
            return $.getJSON(url_getAllOrg, function (data) {
                    allOrg = data;
                    return process(data);
            });
        } else {
            return process(allOrg);
        }
    },
    updater: function(org) {
        updateProgressHeader(org);
    }
}

/* FUNCTIONS */
function getRankIcon(rank, size, header) {
    rankLogoPath = url_baseRankLogo+rank+'.png';
    var img = document.createElement('img');
    img.src = rankLogoPath;
    if(size == undefined) {
        img.height = 26;
        img.width = 26;
    } else {
        if (header) {
            img.height = size;
            img.width = size;
            img.style.position = 'absolute';
            img.style.top = '0';
            img.style.bottom = '0';
            img.style.margin = 'auto';
            img.style.left = '0px';
        } else {
            img.height = size;
            img.width = size;
        }
    }
    return img.outerHTML;
}
function generateRankingSheet(rank) {
    var table = document.createElement('table');
    table.classList.add('table', 'table-striped');
    table.style.marginBottom = '0px';
    //head
    var thead = document.createElement('thead');
    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.innerHTML = "Rank";
    tr.appendChild(th);
    var th = document.createElement('th');
    th.innerHTML = "Requirement (CP)";
    tr.appendChild(th);
    thead.appendChild(tr);
    //body
    var tbody = document.createElement('tbody');
    for (var i=1; i<=maxRank; i++) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.innerHTML = getRankIcon(i, 20);
        td.style.padding = "2px";
        tr.appendChild(td);
        var td = document.createElement('td');
        td.innerHTML = Math.pow(rankMultiplier, i);
        td.style.padding = "2px";
        tr.style.textAlign = "center";
        if (i == rank) { // current org rank
            tr.classList.add('info')
        }
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
    table.appendChild(thead);
    table.appendChild(tbody);
    return table.outerHTML;
}

function addToTableFromJson(datatable, url) {
    $.getJSON( url, function( data ) {
        for (i in data) {
            var row = data[i];
            i = parseInt(i);
            var to_add = [
                i+1,
                getRankIcon(row.rank),
                row.logo_path,
                row.org
            ];
            datatable.row.add(to_add);
        }
        datatable.draw();
    });
}

function updateProgressHeader(org) {
    // get Org rank
    $.getJSON( url_getOrgRank+'?org='+org, function( data ) {
        console.log(data);
        datatableTop.draw();
        var rank = Math.floor(data.rank);
        $('#btnCurrRank').show();
        $('#orgText').text(data.org);
        var popoverRank = $('#btnCurrRank').data('bs.popover');
        popoverRank.options.content = generateRankingSheet(rank);
        $('#orgRankDiv').html(getRankIcon(rank, 40, true));
        $('#orgNextRankDiv').html(getRankIcon(rank+1, 40, true));
        $('#progressBarDiv').width((data.rank - rank)*150); //150 is empty bar width
        // update color in other dataTables
        datatableTop.rows().every( function() {
            var row = this.node();
            if(this.data()[3] == data.org) { row.classList.add('info'); } else { row.classList.remove('info'); }
        });
        datatableFame.rows().every( function() {
            var row = this.node();
            if(this.data()[3] == data.org) { row.classList.add('info'); } else { row.classList.remove('info'); }
        });
        datatableCateg.rows().every( function() {
            var row = this.node();
            if(this.data()[3] == data.org) { row.classList.add('info'); } else { row.classList.remove('info'); }
        });
        datatableLast.rows().every( function() {
            var row = this.node();
            if(this.data()[3] == data.org) { row.classList.add('info'); } else { row.classList.remove('info'); }
        });
    });
}

function showOnlyOrg() {
    datatableCateg.search( $('#orgText').text() ).draw();
}

$(document).ready(function() {
    if(currOrg != "") // currOrg selected
        updateProgressHeader(org)
    $('#orgName').typeahead(typeaheadOption);
    $('#btnCurrRank').popover(popOverOption);
    datatableTop = $('#topContribTable').DataTable(optionDatatable_top);
    datatableFame = $('#fameTable').DataTable(optionDatatable_fame);
    datatableCateg = $('#categTable').DataTable(optionDatatable_Categ);
    datatableLast = $('#lastTable').DataTable(optionDatatable_last);
    // top contributors
    addToTableFromJson(datatableTop, url_getTopContributor);
    // hall of fame
    addToTableFromJson(datatableFame, url_getTopContributor);
    // last contributors
    addToTableFromJson(datatableLast, url_getTopContributor);
    // category per contributors
    $.getJSON( url_getCategPerContrib, function( data ) {
        for (i in data) {
            var row = data[i];
            i = parseInt(i);
            var to_add = [
                i+1,
                getRankIcon(row.rank),
                row.logo_path,
                row.org,
                row.network_activity,
                row.payload_delivery,
                row.others
            ];
            datatableCateg.row.add(to_add);
        }
        datatableCateg.draw();
    });
    // top 5 contrib overtime
    $.getJSON( url_getTop5Overtime, function( data ) {
        var plotLineChart = $.plot("#divTop5Overtime", data, optionsLineChart);
    });
});
