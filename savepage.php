<?php

$folder = $_POST['foldername'];
$current_page = $_POST['current_page'];
$extension = $_POST['extension'];
$filename = $_FILES['file']['name'];
$location = "";

$array = array();

if (!file_exists("./books/$folder"))
{
    mkdir("./books/$folder", 0777, true);
}

$location = "./books/$folder/$current_page.$extension";

if(move_uploaded_file($_FILES['file']['tmp_name'], $location))
{
    array_push($array, array('success' => true, 'uploadedFile' => $location, 'message' => 'Upload success', 'folder' => $folder));
}
else
{
    array_push($array, array('success' => false, 'uploadedFile' => ' ', 'message' => 'Upload error', 'folder' => $folder));
}

echo json_encode($array);
?>