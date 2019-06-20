# Usage: ruby build-langs.rb /path/to/esolang-box/boxes.yml

require 'yaml'
require 'json'

$boxes = YAML::load_file(ARGV[0])

$langs = []

def iterate(lang, parent = nil, depth = 0)
  lang.each do |key, value|
    unless key.start_with? '_'
      $langs << {slug: key, name: value['_name'], link: value['_link'], disasm: !value['_disasm'].nil?}
      iterate value, key, depth + 1
    end
  end
end

iterate $boxes

File.write File.join(__dir__, 'langs.json'), JSON.pretty_generate($langs)
