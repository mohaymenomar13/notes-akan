<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$root = "root";
$password = "";
$dbname = "crud";

$conn = new mysqli($servername, $root, $password, $dbname);

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $stmt = $conn->prepare("SELECT * FROM users");
    $stmt->execute();
    $result = $stmt->get_result();
    $row = array();
    while ($r = $result->fetch_assoc()) {
        $row[] = $r;
    }
    echo json_encode($row);
    $stmt->close();
} else if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $user_id = $_GET['user_id'];
    $name = $_GET['name'];
    $email = $_GET['email'];
    $password = $_GET['password'];

    $stmt = $conn->prepare("UPDATE users SET name=?, email=?, password=? WHERE user_id=?");
    $stmt->bind_param("ssss", $name, $email, $password, $user_id);
    if ($stmt->execute()) {
        echo json_encode("Successfully updated");
    } else {
        echo json_encode("Failed to update");
    }
    $stmt->close();
} else if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $user_id = $_GET['user_id'];

    $stmt = $conn->prepare("DELETE FROM users WHERE user_id=?");
    $stmt->bind_param("s", $user_id);

    $stmt2 = $conn->prepare("DELETE FROM notes WHERE user_id=?");
    $stmt2->bind_param("s", $user_id);

    $stmt->execute();
    $stmt2->execute();

    echo json_encode("Successfully deleted user");
    $stmt->close();
    $stmt2->close();
}

$conn->close();
?>