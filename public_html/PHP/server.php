<?php
	$f = fopen("semafor","w");
    flock($f,LOCK_EX);
    
    $suroweDane = file_get_contents("php://input");
    $daneJSON = json_decode($suroweDane,true);

    $polecenie = intval($daneJSON['polecenie']);

    if(isset($daneJSON['polecenie']))
    {
        $polecenie = intval($daneJSON['polecenie']);
        switch($polecenie)
        {
            case 1: 
                $wybranyPlik = $daneJSON['plik'];
                $plik = fopen($wybranyPlik, "r") or die("Bład odczytu pliku");
                $odczytPlik = fread($plik, filesize("dane"));
                fclose($plik);

                echo $odczytPlik;
            break;

            case 2: 
                $wynik = '';
                $data = date("Y-m-d_H-i-s"); 
                $name = $data.'.data';
                file_put_contents($name,$suroweDane);
            break;

            case 3:
                $wynik = '';
                $files = glob('{*.data}', GLOB_BRACE);
                /*print_r($files);*/
                foreach($files as $file){
                    $file = substr($file, 0, -5);
                    if ($wynik === '') {
                        $wynik = '<option value="'.$file.'">'.$file.'</option>';
                    } else {
                        $wynik .= '<option value="'.$file.'">'.$file.'</option>';
                    }
                }
                print_r($wynik);
            break;

            default: 
                $wynik = array('status' => false, 'kod' => 3, 'wartosc' => 'Podane zostało złe polecenie');
        }
    }

    flock($f, LOCK_UN); 
    fclose($f);
?>