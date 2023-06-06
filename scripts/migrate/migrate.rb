`bundle init` unless File.exist? "Gemfile"
`bundle add mongo` unless File.exist? "Gemfile"
`bundle install` unless !File.exist? "Gemfile"

require 'mongo'
require 'json'

mport  = '8001' #ENV['MINIO_API_PORT'] 
mhost  = '127.0.0.1' #ENV['MINIO_DOMAIN'] 
mpass  = ENV['MINIO_PASSWORD']
muser  = ENV['MINIO_USER']
mproto = ENV['MINIO_PROTOCOL']

minio = mproto + "://" + mhost+":" + mport + " " + muser + " " + mpass

mclient = Mongo::Client.new("#{ENV["DB_URL"]}")
db = mclient.database

# verify mc 
`wget https://dl.min.io/client/mc/release/linux-amd64/mc` unless File.exist? "mc" 
`chmod +x mc`
`./mc alias set minio #{minio}` 


group_to_workspace = db[:groups].find().map{|x|[x["_id"],x["_workspace"]]}.to_h
groups_ids =  db[:workspaces].find().map{|x| x["_id"]}

mfiles = {}
src_dir = ENV['src'] || '/data'
files = Dir.glob("#{src_dir}/**/*").select { |e| File.file? e }

mfiles[:stories] = db[:stories].find().map{|x| [x["_workspace"],[x["header_pic"],x["icon_pic"]]]}
mfiles[:users] = db[:users].find().map{|x| [x["_workspace"],[x["profile_pic"]]]}
mfiles[:groups] = db[:groups].find().map{|x| [x["_workspace"],[x["group_avatar"]]]}
mfiles[:lounges] = db[:lounges].find().map{|x| [x["_workspace"],[x["header_pic"],x["icon_pic"]]]}
mfiles[:workspaces] = db[:workspaces].find().map{|x| [x["_id"],[x["workspace_avatar"]]]}
mfiles[:files] = db[:files].find().map{|x| [group_to_workspace[x["_group"]],[x["modified_name"]]]}
mfiles[:portfolios] = db[:portfolios].find().map{|x| [group_to_workspace[x["_groups"].first],[x["portfolio_avatar"]]]}

groups_ids.each{|x| `./mc mb minio/#{x} --json`;`./mc rm --recursive --force minio/#{x}/`}

mfiles.keys.each do |k|
    mfiles[k].each do |info|
        info[1].each do |f|
            next unless f 
            f = f.to_s if f.class.to_s == "BSON::ObjectId"   
            search_f = f.split("/")[-1]
            file = files.select{|x| x if x.include? search_f}
            if file.count>0
                file.each do |ff|
                    next if ff.include? "assets"
                    upload = `./mc cp '#{ff}' 'minio/#{info[0]}/#{f}' --json`
                    if upload.include? "success"
                        # puts "-----------------------"
                        # puts "Uploaded file - #{ff}"
                        # puts "#{f}"
                    else 
                        puts "-----------------------"
                        puts upload
                    end
                end
            else
                next if f.include? "assets"
                puts "-----------------------------"
                puts "FILE NOT FOUND"
                puts f
            end
        end
    end
end