const jpdbBaseURL = "https://cors-anywhere.herokuapp.com/http://api.login2explore.com:5577";
const jpdbIML = "/api/iml";
const jpdbIRL = "/api/irl";
const dbName = "SCHOOL-DB";
const relationName = "STUDENT-TABLE";
const connToken = "90934675|-31949205393727856|90956110";

const rollNoInput = document.getElementById("rollNo");
const saveBtn = document.getElementById("saveBtn");
const updateBtn = document.getElementById("updateBtn");
const resetBtn = document.getElementById("resetBtn");

const fields = ["fullName", "class", "birthDate", "address", "enrollDate"];

function toggleFields(disable) {
  fields.forEach(id => {
    document.getElementById(id).disabled = disable;
  });
}

function resetForm() {
  document.getElementById("studentForm").reset();
  rollNoInput.disabled = false;
  toggleFields(true);
  saveBtn.disabled = true;
  updateBtn.disabled = true;
  resetBtn.disabled = true;
  rollNoInput.focus();
}

function validateForm() {
  for (let id of fields) {
    const val = document.getElementById(id).value.trim();
    if (val === "") {
      alert("Please fill all fields!");
      document.getElementById(id).focus();
      return false;
    }
  }
  return true;
}

function createGetRequest(rollNo) {
  return JSON.stringify({
    token: connToken,
    cmd: "GET_BY_KEY",
    dbName,
    rel: relationName,
    key: rollNo
  });
}

function createPutRequest(data) {
  return JSON.stringify({
    token: connToken,
    cmd: "PUT",
    dbName,
    rel: relationName,
    jsonStr: data
  });
}

function createUpdateRequest(data, recordNo) {
  return JSON.stringify({
    token: connToken,
    cmd: "UPDATE",
    dbName,
    rel: relationName,
    record: recordNo,
    jsonStr: data
  });
}

function executeCommandAtGivenBaseUrl(url, endpoint, reqString) {
  let result = "";
  $.ajax({
    url: url + endpoint,
    type: "POST",
    data: reqString,
    contentType: "application/json",
    async: false,
    success: function(response) {
      result = response; // Ensure we return a JavaScript object
    },
    error: function(error) {
      result = error.responseText; // Return error text in case of failure
    }
  });
  return result;
}

function saveStudent() {
  if (!validateForm()) return;

  const studentData = {
    id: rollNoInput.value.trim(),
    name: document.getElementById("fullName").value.trim(),
    class: document.getElementById("class").value.trim(),
    birthDate: document.getElementById("birthDate").value,
    address: document.getElementById("address").value.trim(),
    enrollDate: document.getElementById("enrollDate").value
  };

  const req = createPutRequest(JSON.stringify(studentData));
  jQuery.ajaxSetup({ async: false });
  executeCommandAtGivenBaseUrl(jpdbBaseURL, jpdbIML, req);
  jQuery.ajaxSetup({ async: true });

  alert("Record saved successfully!");
  resetForm();
}

function updateStudent(recordNo) {
  if (!validateForm()) return;

  const studentData = {
    id: rollNoInput.value.trim(),
    name: document.getElementById("fullName").value.trim(),
    class: document.getElementById("class").value.trim(),
    birthDate: document.getElementById("birthDate").value,
    address: document.getElementById("address").value.trim(),
    enrollDate: document.getElementById("enrollDate").value
  };

  const req = createUpdateRequest(JSON.stringify(studentData), recordNo);
  jQuery.ajaxSetup({ async: false });
  executeCommandAtGivenBaseUrl(jpdbBaseURL, jpdbIML, req);
  jQuery.ajaxSetup({ async: true });

  alert("Record updated successfully!");
  resetForm();
}

rollNoInput.addEventListener('blur', () => {
  const rollNo = rollNoInput.value.trim();
  if (!rollNo) return;

  const getReq = createGetRequest(rollNo);
  jQuery.ajaxSetup({ async: false });
  const res = executeCommandAtGivenBaseUrl(jpdbBaseURL, jpdbIRL, getReq);
  jQuery.ajaxSetup({ async: true });

  const resultObj = JSON.parse(res);
  if (resultObj.status === 400) {
    alert("Failed to retrieve data. Please try again.");
    return;
  }

  if (resultObj.data) {
    const data = JSON.parse(resultObj.data).record;
    const recordNo = JSON.parse(resultObj.data).rec_no;

    document.getElementById("fullName").value = data.name;
    document.getElementById("class").value = data.class;
    document.getElementById("birthDate").value = data.birthDate;
    document.getElementById("address").value = data.address;
    document.getElementById("enrollDate").value = data.enrollDate;

    rollNoInput.disabled = true;
    toggleFields(false);
    updateBtn.disabled = false;
    saveBtn.disabled = true;
    resetBtn.disabled = false;

    // Prevent multiple event bindings
    saveBtn.onclick = null;
    updateBtn.onclick = () => updateStudent(recordNo);
  } else {
    toggleFields(false);
    saveBtn.disabled = false;
    updateBtn.disabled = true;
    resetBtn.disabled = false;
    document.getElementById("fullName").focus();

    // Prevent multiple event bindings
    saveBtn.onclick = saveStudent;
  }
});

resetBtn.onclick = resetForm;

// Enable keyboard accessibility
rollNoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    rollNoInput.blur();
  }
});
