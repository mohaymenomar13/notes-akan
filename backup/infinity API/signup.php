<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true'); 

$hostname = "sql113.infinityfree.com";
$username = "if0_37867212";
$password = "Ngick1301";
$dbname = "if0_37867212_note_akan";

$conn = new mysqli($hostname, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo "Connection failed: " . $conn->connect_error;
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!isset($_POST['name']) || !isset($_POST['email']) || !isset($_POST['password'])) {
        http_response_code(400);
        echo "Invalid request";
        exit;
    }

    $stmt = $conn->prepare("SELECT email FROM users WHERE email = ?");
    $stmt->bind_param("s", $_POST['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        http_response_code(409);
        echo "Email already exists";
        exit;
    }

    $user_id = md5(uniqid(mt_rand(), true));

    $stmt = $conn->prepare("INSERT INTO users (user_id, name, email, password) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $user_id, $_POST['name'], $_POST['email'], $_POST['password']);
    if ($stmt->execute()) {
        setcookie("user_session", $user_id, time() + 3600, "/");
        http_response_code(201);
        echo "New record created successfully\n";
    } else {
        http_response_code(500);
        echo "Error: " . $conn->error;
    }
    $stmt->close();
}

$conn->close();
?>