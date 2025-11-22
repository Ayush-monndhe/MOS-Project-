import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class WeatherApp {
    public static void main(String[] args) {
        try {
            String apiKey = "d1df8b42dc29b78753a8f57fa737bb03";
            System.out.print("Enter city name: ");
            java.util.Scanner sc = new java.util.Scanner(System.in);
            String city = sc.nextLine();
            sc.close();

            String urlString = "https://api.openweathermap.org/data/2.5/weather?q="
                    + city + "&appid=" + apiKey + "&units=metric";

            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String inputLine;
            StringBuilder content = new StringBuilder();

            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }

            in.close();
            conn.disconnect();

            // Extract simple data manually
            String json = content.toString();
            String temp = json.split("\"temp\":")[1].split(",")[0];
            String desc = json.split("\"description\":\"")[1].split("\"")[0];

            System.out.println("Temperature: " + temp + "°C");
            System.out.println("Weather: " + desc);

        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
