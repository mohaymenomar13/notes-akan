<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true'); 

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "crud";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo "Connection failed: " . $conn->connect_error;
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = "SELECT * FROM users";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $data = array();
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
    } else {
        http_response_code(404);
        echo "No records found";
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!isset($_POST['name']) || !isset($_POST['email']) || !isset($_POST['password'])) {
        http_response_code(400);
        echo "Invalid request";
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