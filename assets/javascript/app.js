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

//Step 2: Google authentication setup

function googleSignIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
    'login_hint': 'user@example.com'
    });
    firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    console.log("Success");
    // ...
    }).catch(function(error) {
    // Handle Errors here.
    console.log("Failed")
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    console.log(errorCode);
    console.log(errorMessage);
    console.log(email);
    // ...
    });
    firebase.auth().signOut().then(function() {
    // Sign-out successful.
    }).catch(function(error) {
    // An error happened.
    });
}
    //adding sigin click
    $("#googleSignIn").on("click", function(){
    googleSignIn();
});


// Step 3: Capture Button Click for adding valid data to the train table 

$("#add-train").on("click", function(event){
        //Prevent form from submitting itself.
        event.preventDefault();
        // Logic for retrieving the most recent train data added.
        let TrainName = $("#trainName").val().trim();
        let Destination = $("#destination").val().trim();
        let FirstTrainTime = $("#firstTrainTime").val().trim();
        let TrainFrequency = $("#trainFrequency").val().trim();
        console.log(" I am in add train para");

        //Form Validation
        if(TrainName === "" || Destination === "" || FirstTrainTime === "" || TrainFrequency === "" )
        {
            alert(" All fields are mandatory, please fill out the complete form");
            return;
        }

        //Validate input start time using regEx
        var term = FirstTrainTime;
        var re = new RegExp("^([0-1][0-9]|2[0-3]):([0-5][0-9])$");
        if (re.test(term)) {
            console.log("Valid"); 
        }
        else {
            console.log("Invalid");
            alert ("please enter time in valid format HH:mm");
            return;
        }
        
        //Adding initial data to your Firebase database.
        db.ref().push({
            trainName: TrainName,
            trainDestination: Destination,
            trainStartTime: FirstTrainTime,
            trainFrequency: TrainFrequency, 
        })
});


// Step 4:  Firebase watcher + initial loader

db.ref().on("child_added", function(snapshot){
        console.log(snapshot.val());
        let trainData={
            tname: snapshot.val().trainName,
            destination: snapshot.val().trainDestination,
            startTime: snapshot.val().trainStartTime,
            tFrequency: snapshot.val().trainFrequency,
            key: snapshot.key,
        }
        console.log(trainData);
        let tKey = trainData.key;

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
        + minutesAway  + "</td><td>"
        +'<input type="checkbox" name="record" data-value='+ tKey + '/>' + "</td></tr>");
    },
    // Handle the error
    function(errorObject) {
        console.log("The read failed: " + errorObject.code);
});

//Displaying current Time
function updateTime() {
    $("#currentTime").text(moment(moment()).format("dddd, MMMM Do YYYY, H:mm:ss"));
    }
    setInterval(updateTime, 1000);

//Step 4: Find and remove selected table rows
$("#remove-train").on("click",function(event){
        event.preventDefault();
        let confirmDelete = confirm("Are you sure you want to delete this train? Clicking OK removes it permanently from database and table both. Just to remove from display click cancel");
        $("table tbody").find('input[name="record"]').each(function(){
            if($(this).is(":checked")){
                if(confirmDelete){
                //this removes train info from db.
                let rm = $(this).attr("data-value");
                db.ref().child(rm).remove();
                //this removes just table from display.
                $(this).parents("tr").remove();
                }
                else{
                //this removes just table from display.
                $(this).parents("tr").remove();
                }
            }
        });
    });
});
