$(document).ready(function() {
// Step 1: Initialize Firebase
// This is the code we copied and pasted from app page
const firebaseConfig = {
    apiKey: "AIzaSyCglYx0ioRFYCrCl86dYs_TJ-OC3QK62rg",
    authDomain: "train-scheduler-6a9e8.firebaseapp.com",
    databaseURL: "https://train-scheduler-6a9e8.firebaseio.com",
    projectId: "train-scheduler-6a9e8",
    storageBucket: "",
    messagingSenderId: "787207131815",
    appId: "1:787207131815:web:d0411021e42bed3e"
  };
firebase.initializeApp(firebaseConfig);
let db = firebase.database();
let train = [];

// Step 2: Capture Button Click for adding train to the table
$("#add-train").on("click", function(event){
        // Don't refresh the page! Prevent form from submitting itself.
        event.preventDefault();

        // Logic for storing and retrieving the most recent train added.
        let TrainName = $("#trainName").val().trim();
        let Destination = $("#destination").val().trim();
        let FirstTrainTime = $("#firstTrainTime").val().trim();
        let TrainFrequency = $("#trainFrequency").val().trim();
        console.log(" I am in add train para");

        // "temporary" object for holding train data
        let newTrain = {
            tname: TrainName,
            destination: Destination,
            startTime: FirstTrainTime,
            tFrequency: TrainFrequency,
        };


        //Adding initial data to your Firebase database.
        db.ref().push({
            trainName: TrainName,
            trainDestination: Destination,
            trainStartTime: FirstTrainTime,
            trainFrequency: TrainFrequency,  
        })
        train.push(newTrain);
});


// Step 3:  Firebase watcher + initial loader
db.ref().on("child_added", function(snapshot){
        console.log(snapshot.val());
        let trainData={
            tname: snapshot.val().trainName,
            destination: snapshot.val().trainDestination,
            startTime: snapshot.val().trainStartTime,
            tFrequency: snapshot.val().trainFrequency,
        }
        console.log(trainData);

        let firstTimeConverted = moment(trainData.startTime, "HH;mm").subtract(1, "years");


    // Current Time
      let currentTime = moment();
      console.log("CURRENT TIME: " + moment(currentTime).format("HH:mm"));

    //Time Difference between current time and train start time
        let timeDifference = moment().diff(moment(firstTimeConverted), "minutes");
        console.log("Difference in Time: " + timeDifference);

        tRemaining = timeDifference % (trainData.tFrequency);
        console.log(tRemaining);

        let minutesAway = (trainData.tFrequency) - tRemaining;
        console.log(minutesAway);

        let nextArrival = moment().add(minutesAway,"minutes");
        console.log(nextArrival);
        let nextArrivalTime = moment(nextArrival).format("HH:mm");
        console.log(nextArrivalTime);
       
    // full list of items to the well
    $("#trainList > tbody").append("<tr><td>" 
    + trainData.tname + "</td><td>" 
    + trainData.destination + "</td><td>" 
    + trainData.tFrequency + "</td><td>"
    + nextArrivalTime + "</td><td>"
    + minutesAway + "</td></tr>");

    // Handle the errors 
    // function(errorObject) {
    //  console.log("Errors handled: " + errorObject.code);
});

});
//Displaying current Time
function updateTime() {
    $("#currentTime").text(moment(moment()).format("dddd, MMMM Do YYYY, H:mm:ss"));
  }
  setInterval(updateTime, 1000);
