$(document).ready(function() {
  // dashboard.js

  // check for new version
  check_update(mailcow_version, mailcow_repo_url);
  // create diskSpace Chart
  var diskSpaceChartObj = init_diskSpaceChart();
  // update stats data
  update_stats({
    diskSpaceChartObj: diskSpaceChartObj
  });
});

// check for mailcow updates
function check_update(current_version, github_repo_url){
  var github_account = github_repo_url.split("/")[3];
  var github_repo_name = github_repo_url.split("/")[4];

  // get details about latest release
  window.fetch("https://api.github.com/repos/"+github_account+"/"+github_repo_name+"/releases/latest", {method:'GET',cache:'no-cache'}).then(function(response) {
    return response.json();
  }).then(function(latest_data) {
    // get details about current release
    window.fetch("https://api.github.com/repos/"+github_account+"/"+github_repo_name+"/releases/tags/"+current_version, {method:'GET',cache:'no-cache'}).then(function(response) {
      return response.json();
    }).then(function(current_data) {
      // compare releases
      var date_current = new Date(current_data.created_at);
      var date_latest = new Date(latest_data.created_at);
      if (date_latest.getTime() <= date_current.getTime()){
        // no update available
        $("#mailcow_update").removeClass("text-warning text-danger").addClass("text-success");
        $("#mailcow_update").html("<b>The System is on the latest version</b>");
      } else {
        // update available
        $("#mailcow_update").removeClass("text-danger text-success").addClass("text-warning");
        $("#mailcow_update").html(
          `<b>There is an update available
          <a target="_blank" href="https://github.com/`+github_account+`/`+github_repo_name+`/releases/tag/`+latest_data.tag_name+`">`+latest_data.tag_name+`</a></b>`
        );
      }
    }).catch(err => {
      // err
      console.log(err);
      $("#mailcow_update").removeClass("text-success text-warning").addClass("text-danger");
      $("#mailcow_update").html("<b>Could not check for an Update</b>");
    });
  }).catch(err => {
    // err
    console.log(err);
    $("#mailcow_update").removeClass("text-success text-warning").addClass("text-danger");
    $("#mailcow_update").html("<b>Could not check for an Update</b>");
  });
}
// update dashboard host stats - every 5 seconds
// charts => Object with created charts to update
function update_stats(charts){
  // update stats
  window.fetch("/api/v1/get/status/host", {method:'GET',cache:'no-cache'}).then(function(response) {
    return response.json();
  }).then(function(data) {
    // log api data
    console.log(data);

    // update table
    $("#host_date").text(data.system_time);
    $("#host_uptime").text(formatUptime(data.uptime));
    $("#host_cpu_cores").text(data.cpu.cores);
    $("#host_cpu_usage").text(parseInt(data.cpu.usage).toString() + "%");
    $("#host_memory_total").text((data.memory.total / (1024 ** 3)).toFixed(2).toString() + "GB");
    $("#host_memory_usage").text(parseInt(data.memory.usage).toString() + "%");

    if (data.fts.last_scan) $("#xapian_last_fts_reindex").text(data.fts.last_scan);
    if (data.fts.status === '1'){
      $("#xapian_fts_reindex_icon").addClass('icon-spin'); 
      $("#xapian_fts_reindex_btn").prop("disabled", true);
    } else  {
      $("#xapian_fts_reindex_icon").removeClass('icon-spin'); 
      $("#xapian_fts_reindex_btn").prop("disabled", false);
    } 

    $(".vmail-progress").css('width', data.vmail.used_percent);
    $(".vmail-path").text(data.vmail.disk);
    $(".vmail-details").text(data.vmail.used + " / " + data.vmail.total + " (" + data.vmail.used_percent + ")");

    // update chart
    update_diskSpaceChart(charts.diskSpaceChartObj, data.volumes_df);

    // run again in n seconds
    setTimeout(update_stats, 5000, charts);
  });
}
// init disk space doghnut chart
function init_diskSpaceChart(){
  var ctx = document.getElementById('chartDiskSpace');

  var data = {
    labels: [],
    datasets: [{
        data: [],
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(115, 201, 201, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(178, 245, 95, 0.2)',
            'rgba(47, 212, 107, 0.2)',
            'rgba(191, 67, 222, 0.2)',
            'rgba(233, 240, 50, 0.2)',
            'rgba(184, 15, 57, 0.2)',
            'rgba(50, 6, 161, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(115, 201, 201, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(178, 245, 95, 1)',
          'rgba(47, 212, 107, 1)',
          'rgba(191, 67, 222, 1)',
          'rgba(233, 240, 50, 1)',
          'rgba(184, 15, 57, 1)',
          'rgba(50, 6, 161, 1)'
        ],
        borderWidth: 1
    }]
  };

  return new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: false,
          text: 'Disk Space'
        },
        tooltip: {
          callbacks : {
            label: function(tooltipItem) {
              var i = tooltipItem.parsed;
              // b
              if (i < 1000) return i.toFixed(2).toString()+'B';
              // b to kb
              i = i / 1024;
              if (i < 1000) return i.toFixed(2).toString()+'KB';
              // kb to mb
              i = i / 1024;
              if (i < 1000) return i.toFixed(2).toString()+'MB';
              // final mb to gb
              return (i / 1024).toFixed(2).toString()+'GB';
            }
          }
        }
      }
    }
  });
}
// update disk space doghnut chart
// chart => return Object from init_diskSpaceChart function
function update_diskSpaceChart(chart, datapointDict){
  var ordered_datapointDict = Object.keys(datapointDict).sort().reduce(
    (obj, key) => { 
      obj[key] = datapointDict[key]; 
      return obj;
    },
    {}
  );

  var datalabels = [];
  var datapoints = [];

  for (var key in ordered_datapointDict){
    datalabels.push(key);
    datapoints.push(ordered_datapointDict[key]);
  }

  chart.data.labels = datalabels;
  chart.data.datasets[0].data = datapoints;
  chart.update();
}
// trigger dovecot fts reindex
function ftsReindex(){
  $("#xapian_fts_reindex_icon").addClass('icon-spin'); 
  $("#xapian_fts_reindex_btn").prop("disabled", true);

  window.fetch("/api/v1/process/fts/reindex", {method:'POST', body: {}, cache:'no-cache'}).then(res => {
    return res.json();
  }).then(res_json => {
    console.log(res_json);
  }).catch(err => {
    console.log(err);
  });
}

