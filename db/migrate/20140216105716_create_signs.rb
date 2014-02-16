class CreateSigns < ActiveRecord::Migration
  def change
    create_table :signs do |t|
      t.timestamps
      t.string :name
      t.string :url
    end

    create_table :categories do |t|
      t.timestamps
      t.string :name
    end

    create_table :categories_signs do |t|
      t.integer :sign_id
      t.integer :category_id
    end
  end
end
