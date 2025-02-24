<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$servername = 'localhost';
$username = 'root';
$password = '';
$dbname = 'crud';

$conn = new mysqli($servername, $username, $password, $dbname);

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $note_id = $_GET['note_id'];
    $user_id = $_GET['user_id'];

    $stmt = $conn->prepare("SELECT * FROM notes WHERE note_id=? AND user_id=?");
    $stmt->bind_param("ss", $note_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_assoc());
    $stmt->close();
}

$conn->close();
?>