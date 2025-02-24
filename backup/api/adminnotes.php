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
    $stmt = $conn->prepare("SELECT * FROM notes");
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
    $note_id = $_GET['note_id'];
    $new_note_id = $_GET['new_note_id'];
    $new_user_id = $_GET['new_user_id'];
    $title = $_GET['title'];
    $is_public = $_GET['is_public'];

    $stmt = $conn->prepare("UPDATE notes SET note_id=?, user_id=?, title=?, is_public=? WHERE user_id=? AND note_id=?");
    $stmt->bind_param("sssiss", $new_note_id, $new_user_id, $title, $is_public, $user_id, $note_id);
    if ($stmt->execute()) {
        echo json_encode("Successfully updated");
    } else {
        echo json_encode("Failed to update");
    }
    $stmt->close();
} else if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $note_id = $_GET['note_id'];
    $user_id = $_GET['user_id'];

    $stmt = $conn->prepare("DELETE FROM notes WHERE user_id=? AND note_id=?");
    $stmt->bind_param("ss", $user_id, $note_id);
    $stmt->execute();
    echo json_encode("Successfully deleted note");
    $stmt->close();
}

$conn->close();
?>