<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "crud";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $user_id = $_GET['user_id'];
    $newPassword = $_GET['newPassword'];
    $currentPassword = $_GET['currentPassword'];

    $stmt = $conn->prepare("SELECT password FROM users WHERE user_id = ?");
    $stmt->bind_param("s", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $storedPassword = $row['password'];

    if ($currentPassword === $storedPassword) {
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
        $stmt->bind_param("ss", $newPassword, $user_id);
        if ($stmt->execute()) {
            echo json_encode("Successfully changed password");
        } else {
            echo json_encode("Error: " . $conn->error);
        }
    } else {
        echo json_encode("Invalid current password");
    }

    $stmt->close();
}

$conn->close();

?>