<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$hostname = "sql113.infinityfree.com";
$username = "if0_37867212";
$password = "Ngick1301";
$dbname = "if0_37867212_note_akan";

$conn = new mysqli($hostname, $username, $password, $dbname);

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
  $user_id = $_GET['user_id'];
  
  $stmt = $conn->prepare('SELECT name FROM users WHERE user_id=?');
  $stmt->bind_param('s', $user_id);
  $stmt->execute();
  $result = $stmt->get_result();
  echo json_encode($result->fetch_assoc());
  $stmt->close();
}

$conn->close();
?>