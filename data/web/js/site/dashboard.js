jQuery(function($){
  // dashboard.js
  update_stats();
  check_update(mailcow_version, mailcow_repo_url);
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
function update_stats(){
  window.fetch("/api/v1/get/status/host", {method:'GET',cache:'no-cache'}).then(function(response) {
    return response.json();
  }).then(function(data) {
    $("#host_date").text(data.system_time);
    $("#host_uptime").text(formatUptime(data.uptime));
    $("#host_cpu_usage").text(parseInt(data.cpu_usage).toString() + "%");
    $("#host_memory_usage").text(parseInt(data.mem_usage).toString() + "%");
    $(".vmail-progress").css('width', data.vmail.used_percent);
    $(".vmail-path").text(data.vmail.disk);
    $(".vmail-details").text(data.vmail.used + " / " + data.vmail.total + " (" + data.vmail.used_percent + ")");

    // run again in n seconds
    setTimeout(update_stats, 5000);
  });
}