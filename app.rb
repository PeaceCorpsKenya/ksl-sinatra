require 'sinatra'
require "sinatra/activerecord"

Dir["./models/*.rb"].each {|file| require file }

set :database, "sqlite3:///ksl.sqlite3"
set :public_folder, "public"

# Main template
get '/' do
  page = File.join(settings.public_folder, 'index.html')
  send_file page
end

get "/spacer.gif" do
  send_file File.join(settings.public_folder, "spacer.gif")
end

