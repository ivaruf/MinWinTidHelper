// Saves options to chrome.storage
function save_options() {
    var startTime = document.getElementById('startTime').value;
    var endTime = document.getElementById('endTime').value;
    chrome.storage.sync.set({
      startTime: startTime,
      endTime: endTime
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }

  // stored in chrome.storage.
  function restore_options() {
    chrome.storage.sync.get({
      startTime: '09:00',
      endTime: '16:35'
    }, function(items) {
      document.getElementById('startTime').value = items.startTime;
      document.getElementById('endTime').value = items.endTime;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click',
      save_options);