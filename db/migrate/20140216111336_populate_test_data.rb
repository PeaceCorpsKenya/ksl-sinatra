require 'faker'

class PopulateTestData < ActiveRecord::Migration
  def change
    5.times.each do
      word = Faker::Lorem.word
      Category.create(:name => word)
    end

    25.times.each do
      word = Faker::Lorem.word
      p = Sign.create(:name => word, :url => Faker::Internet.url)
      p.categories << Category.find(1)
      p.categories << Category.find(2)
      p.categories << Category.find(3)
    end
  end
end
