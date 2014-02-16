#!/usr/local/bin/python

from lxml import html
import string
import sqlite3

''' 
This file loads the database of Kenya Sign Language words and videos from
https://github.com/PeaceCorpsKenya/KSL-Glossary
into the local database.
'''

## Set basedir to the root of the repository
## https://github.com/PeaceCorpsKenya/KSL-Glossar
basedir = '../../KSL-Glossary'
## Set dbname to the name of a sqlite3 database to population
dbname = '../ksl.sqlite3'

''' Load word into the database connection con. '''
def load_word(con, word, basedir):
    fid = open('%s/site/%s.html' % (basedir, word), 'rb')
    html_str = fid.read()
    fid.close()
    tree = html.fromstring(html_str)    
    ## Load the Enlgish and Kiswahili words.
    english = tree.xpath('//section[@class="group2"]/p/text()')[1].strip()
    kiswahili = tree.xpath('//section[@class="group2"]/p/text()')[2].strip()
    c = con.cursor()
    #c.execute('INSERT INTO signs (name, kiswahili) VALUES (%s);' % 
    #          (english, kiswahili))
    ## Copy the videos and load their path
    videos = tree.xpath('//section[@class="group2"]/p/video/@src')
    print videos
    for i in range(len(videos)):
        ## Copy the video file (it was easier to use cp -r)
        ## Load the string into the database.
        if(i == 0):
            c.execute("INSERT INTO signs (name, kiswahili, url) VALUES " + 
                      "('%s', '%s', '%s')"
                      % (word, kiswahili, videos[i]))
            con.commit()
        ## TODO Support multiple videos.

''' 
Load all the words that begin with letter into the database connection con.
'''
def load_letter(con, letter, basedir):
    fid = open('%s/site/%c.html' % (basedir, letter), 'rb')
    words_html = fid.read()
    fid.close()
    words_tree = html.fromstring(words_html)    
    words = [str(w).lower().replace(' ', '') for w in 
             words_tree.xpath('//section[@class="group2"]/p/a/text()')]
    for word in words:
        print 'Loading %s' % word
        load_word(con, word, basedir)

''' Populate the database will all words and videos. '''
def populate_db(basedir, dbname):
    ## Connect to the database
    con = sqlite3.connect(dbname)
    ## Load the list of words
    for letter in string.ascii_uppercase:
        try:
            load_letter(con, letter, basedir)
        except Exception as e:
            print e.strerror
            ## TODO Handle errors properly
    ## Disconnect from the database
    con.close()

if __name__ == '__main__':
    populate_db(basedir, dbname)
