
// global variables
// ================
var activeProvince = "ALL";
var activeProvinceName = "";
var activeMunicipality = "ALL";
var activeMunicipalityName = "";
var activeBarangay = "ALL";
var activeBarangayName = "";

var partnerProvinces = [];
var partnerMunicip = [];
var partnerBrgy = [];

var allData = [];
var filteredData = [];
var partnerList = [];
var partnerButtons;

var maxDate;
var minDate;

var pageHeight = $(window).height();
$("#chart1").css("height", pageHeight * 0.75 );

$(window).resize(function(){    
  pageHeight = $(window).height();
  $("#chart1").css("height", pageHeight * 0.75 );
  buildChart();
})

// get CSV file
function getData(){
  d3.csv("data/livelihood.csv", function(data){ 
    formatData(data); 
  });
}

// format CSV data as geoJson
function formatData(data){
  $.each(data, function(index, item) {       
      var thisObject = {
        "admin2": item.admin2,
        "admin3": item.admin3,
        "admin4": item.admin4,
        "province": item.province,
        "municipality": item.municipality,
        "barangay": item.barangay,
        "date": item.date,
        "partner":item.partner,
        "Selected": item["Selected"], 
        "First Installment": item["First Installment"],
        "Second Installment": item["Second Installment"]
      };
      allData.push(thisObject);
  });
  getRanges();
}



function getRanges(){
  var allDates = [];
  $(allData).each(function(i, report){
    var selected = report.date;
    var selectedDate = new Date(selected);
    allDates.push(selectedDate);
    var partnerName = report.partner;
    if (partnerList.indexOf(partnerName) === -1){
        partnerList.push(partnerName);
    }; 
  });
  maxDate = new Date(Math.max.apply(null, allDates));
  minDate = new Date(Math.min.apply(null, allDates));
  buildPartnerFilter();
}

function buildPartnerFilter() {  
  var partnerFilterHtml = '<button id="ALL-PARTNERS" class="btn btn-xs btn-donor filtering all" type="button" onclick="togglePartnerFilter('+"'ALL-DONORS'"+', this);"'+
      ' style="margin-right:10px;">All<span class="glyphicon glyphicon-check" style="margin-left:4px;"></span></button>';
  partnerList.sort();
  $.each(partnerList, function(index, partner){
    var itemHtml = '<button id="'+partner+'" class="btn btn-xs btn-donor" type="button" onclick="togglePartnerFilter('+"'"+partner+"'"+', this);">'+partner+
        '<span class="glyphicon glyphicon-unchecked" style="margin-left:4px;"></span></button>';
    partnerFilterHtml += itemHtml;    
  });
  $('#partnerButtons').html(partnerFilterHtml);
  partnerButtons = $("#partnerButtons").children();
  buildProvinceDropdown(); 
}

function resetFilters() {
  activeProvince = "ALL";
  activeMunicipality = "ALL";
  activeBarangay = "ALL";          
  $('#dropdown-menu-municipality').html('<li class="disabled"><a role="menuitem" href="#">First select a province</a></li>');
  $('#dropdown-menu-barangay').html('<li class="disabled"><a role="menuitem" href="#">First select a municipality</a></li>');
  $("#selected-admin-label").html("All areas");
  $.each(partnerButtons, function(i, button){
    $(button).removeClass("disabled");
    $(button).children().removeClass("glyphicon-check");
    $(button).children().addClass("glyphicon-unchecked");
    $(button).removeClass("filtering");
  });
  var partnerAllFilter = $('#partnerButtons').find('.all');
  $(partnerAllFilter).children().removeClass("glyphicon-unchecked"); 
  $(partnerAllFilter).children().addClass("glyphicon-check");
  $(partnerAllFilter).addClass("filtering");
  changePartnerFilter(); 
}

function buildProvinceDropdown() {
  var provinceList = [];
  var provinceAdminLookup = {};
  $.each(allData, function(index, record){
    var thisProvince = record.province;
    if($.inArray(thisProvince, provinceList) === -1){
      provinceList.push(thisProvince);
      provinceAdminLookup[record.province] = record.admin2;
    }
  });
  // sort so that the provinces appear in alphabetical order in dropdown
  provinceList = provinceList.sort(); 
  // create item elements in dropdown list   
  for(var i = 0; i < provinceList.length; i++) {
      var item = provinceList[i];
      var listItemHtml = '<li id="'+provinceAdminLookup[item]+'"><a href="#" onClick="provinceSelect('+
        "'"+ provinceAdminLookup[item] +"', this"+ '); return false;">' + item + "</li>";
      $('#dropdown-menu-province').append(listItemHtml);       
  }
  // $("#loading").fadeOut(300);
  filterData();
}

function provinceSelect(admin2, element){
  activeProvince = admin2;
  activeProvinceName = $(element).html();
  activeMunicipality = "ALL";
  activeMunicipalityName = "";
  activeBarangay = "ALL";
  activeBarangayName = "";
  $("#selected-admin-label").html(activeProvinceName);
  buildMunicipalityDropdown();
  disablePartnerButtons();
  filterData();
}

function municipalitySelect(admin3, element){
  activeMunicipality = admin3;
  activeMunicipalityName = $(element).html();
  activeBarangay = "ALL";
  activeBarangayName = "";
  $("#selected-admin-label").html(activeProvinceName + ", " + activeMunicipalityName);
  $("#selected-barangay-text").empty();
  buildBarangayDropdown();
  disablePartnerButtons();
  filterData();
}

function barangaySelect(admin4, element){
  activeBarangay = admin4;
  activeBarangayName = $(element).html();
  $("#selected-admin-label").html(activeProvinceName + ", " + activeMunicipalityName + ", "+ activeBarangayName);
  disablePartnerButtons();
  filterData();
}

function togglePartnerFilter (filter, element) {
  if($(element).hasClass("filtering") !== true){
  // if clicked element is off turn every button off and turn clicked on   
    $.each(partnerButtons, function(i, button){
      $(button).children().removeClass("glyphicon-check");
      $(button).children().addClass("glyphicon-unchecked");
      $(button).removeClass("filtering");
    });
    $(element).children().removeClass("glyphicon-unchecked"); 
    $(element).children().addClass("glyphicon-check");
    $(element).addClass("filtering");         
  } else {
  // if clicked element is on turn it off and turn 'all' filter on
    $.each(partnerButtons, function(i, button){
      $(button).children().removeClass("glyphicon-check");
      $(button).children().addClass("glyphicon-unchecked");
      $(button).removeClass("filtering");
    });
    var partnerAllFilter = $('#partnerButtons').find('.all');
    $(partnerAllFilter).children().removeClass("glyphicon-unchecked"); 
    $(partnerAllFilter).children().addClass("glyphicon-check");
    $(partnerAllFilter).addClass("filtering");
  }
  changePartnerFilter();
}

function changePartnerFilter(){
  partnerProvinces = [];
  partnerMunicip = [];
  partnerBrgy = [];
  var selectedPartner = $("#partnerButtons").find(".filtering").attr("id");
  if(selectedPartner === "ALL-PARTNERS"){
    $("#selected-partner-label").html("- All cooperating partners");
  } else {
    $("#selected-partner-label").html(" - " + selectedPartner);
  }
  $.each(allData, function(index, record){
    if(selectedPartner === record.partner  || selectedPartner === "ALL-PARTNERS" ){
      partnerProvinces.push(record.admin2);
      partnerMunicip.push(record.admin3);
      partnerBrgy.push(record.admin4); 
    }    
  });
  disableAdminButtons();
  filterData();
}

function buildMunicipalityDropdown(){
  $('#dropdown-menu-municipality').empty();
  $('#dropdown-menu-barangay').html('<li class="disabled"><a role="menuitem" href="#">First select a municipality</a></li>');
  var municipalityList = [];
  var municipalityAdminLookup = {};
  $.each(allData, function(index, record){
    var thisMunicipality = record.municipality;
    if($.inArray(thisMunicipality, municipalityList) === -1 && record.admin2 === activeProvince){
      municipalityList.push(thisMunicipality);
      municipalityAdminLookup[record.municipality] = record.admin3;
    }
  });
  // sort so that they appear in alphabetical order in dropdown
  municipalityList = municipalityList.sort(); 
  // create item elements in dropdown list   
  for(var i = 0; i < municipalityList.length; i++) {
      var item = municipalityList[i];
      var listItemHtml = '<li id="'+municipalityAdminLookup[item]+'"><a href="#" onClick="municipalitySelect(' +
        "'"+ municipalityAdminLookup[item] +"', this"+ '); return false;">' + item + "</li>"
      $('#dropdown-menu-municipality').append(listItemHtml);       
  }
}

function buildBarangayDropdown() {
  $('#dropdown-menu-barangay').empty();
  var barangayList = [];
  var barangayAdminLookup = {};
  $.each(allData, function(index, record){
    var thisBarangay = record.barangay;
    if($.inArray(thisBarangay, barangayList) === -1 && record.admin2 === activeProvince && record.admin3 === activeMunicipality){
      barangayList.push(thisBarangay);
      barangayAdminLookup[record.barangay] = record.admin4;
    }
  });
  // sort so that they appear in alphabetical order in dropdown
  barangayList = barangayList.sort(); 
  // create item elements in dropdown list   
  for(var i = 0; i < barangayList.length; i++) {
      var item = barangayList[i];
      var listItemHtml = '<li id="'+barangayAdminLookup[item]+'"><a href="#" onClick="barangaySelect(' +
        "'"+ barangayAdminLookup[item] +"', this"+ '); return false;">' + item + "</li>"
      $('#dropdown-menu-barangay').append(listItemHtml);       
  }
}



function disableAdminButtons(){
  var selectedPartner = $("#partnerButtons").find(".filtering").attr("id");
  var provinceButtons = $('#dropdown-menu-province').children();
  $(provinceButtons).removeClass("disabled");
  $.each(provinceButtons, function(index, button){
    var buttonAdmin = $(button).attr("id");
    if($.inArray(buttonAdmin, partnerProvinces) === -1){
      $(button).addClass("disabled");
    }
  });
  var municipalityButtons = $('#dropdown-menu-municipality').children();
  $(municipalityButtons).removeClass("disabled");
  $.each(municipalityButtons, function(index, button){
    var buttonAdmin = $(button).attr("id");
    if($.inArray(buttonAdmin, partnerMunicip) === -1){
      $(button).addClass("disabled");
    }
  });
  var barangayButtons = $('#dropdown-menu-barangay').children();
  $(barangayButtons).removeClass("disabled");
  $.each(barangayButtons, function(index, button){
    var buttonAdmin = $(button).attr("id");
    if($.inArray(buttonAdmin, partnerBrgy) === -1){
      $(button).addClass("disabled");
    }
  });
}

function disablePartnerButtons(){
  areaPartners = ["ALL-PARTNERS"]; 
  $.each(allData, function(index, record){  
      // operation overview
      if("ALL" === activeProvince){
        areaPartners.push(record.partner);      
      }
      // province active
      if(record.admin2 === activeProvince && "ALL" === activeMunicipality && "ALL" === activeBarangay){
        areaPartners.push(record.partner);
      }
      // muncip active
      if(record.admin3 === activeMunicipality && "ALL" === activeBarangay){
        areaPartners.push(record.partner);
      }
      // brgy active
      if(record.admin4 === activeBarangay){
        areaPartners.push(record.partner);
      } 
  });
  $(partnerButtons).removeClass("disabled");
  $.each(partnerButtons, function(index, button){
    var buttonPartner = $(button).attr("id");
    if($.inArray(buttonPartner, areaPartners) === -1){
      $(button).addClass("disabled");
    }
  });
}

function filterData(){
  var selectedPartner = $("#partnerButtons").find(".filtering").attr("id");
  filteredData = [];
  $.each(allData, function(index, record){
    if(record.partner === selectedPartner || "ALL-PARTNERS" === selectedPartner){
      if(record.admin2 === activeProvince || "ALL" === activeProvince){
        if(record.admin3 === activeMunicipality || "ALL" === activeMunicipality){
          if(record.admin4 === activeBarangay || "ALL" === activeBarangay){
            filteredData.push(record);
          }
        }
      }
    }
  });
  buildHistory();
}

function buildHistory (){
	chartData = [];
  var categoryList = ["Selected", "First Installment", "Second Installment"];
  $.each(categoryList, function(index, category){
    var categoryData = {};
    categoryData.key = category;
    categoryData.values = [];
    chartData.push(categoryData);
  });
  var selectedTotal = 0;
  var firstTotal = 0;
  var  secondTotal = 0;
  // Total = 0;
  for (var d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
    $.each(filteredData, function(i, record){  
      if((new Date(record.date)).getTime() == d.getTime()){
          selectedTotal += parseInt(record["Selected"], 10);
          firstTotal += parseInt(record["First Installment"], 10);
          secondTotal += parseInt(record["Second Installment"], 10);         
      }         
    });
    currentDate = new Date(d);
    for(x in chartData){
      if(chartData[x].key === "Selected"){
        chartData[x].values.push([currentDate.getTime(), selectedTotal]);
      }
      if(chartData[x].key === "First Installment"){
        chartData[x].values.push([currentDate.getTime(), firstTotal]); 
      }
      if(chartData[x].key === "Second Installment"){
        chartData[x].values.push([currentDate.getTime(), secondTotal]);       
      }
    }  
  }
  buildChart();
}

function buildChart(){
  $('#chart1').empty();

  var colors = d3.scale.category20();
  keyColor = function(d, i) {return colors(d.key)};

  var chart;
  nv.addGraph(function() {
    chart = nv.models.lineChart()
                  .margin({right:30})
                  .useInteractiveGuideline(true)
                  .x(function(d) { return d[0] })
                  .y(function(d) { return d[1] })
                  .color(keyColor)
                  .transitionDuration(300);

    chart.xAxis
        .tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });

    chart.yAxis
        .tickFormat(d3.format(',.0f'));

    d3.select('#chart1')
      .datum(chartData)
      .transition().duration(1000)
      .call(chart)
      .each('start', function() {
          setTimeout(function() {
              d3.selectAll('#chart1 *').each(function() {
                console.log('start',this.__transition__, this)
                if(this.__transition__)
                  this.__transition__.duration = 1;
              })
            }, 0)
        })

    nv.utils.windowResize(chart.update);

    return chart;
  });


}




getData();



