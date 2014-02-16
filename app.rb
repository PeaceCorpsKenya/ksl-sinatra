require 'sinatra'
require "sinatra/activerecord"

set :database, "sqlite3:///ksl.sqlite3"
set :public_folder, "/public"

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

